import { db, memoryStore } from '@/db';
import { AppModule } from '@/src/app.module';
import { hashPassword } from '@/utils';
import { BullModule } from '@nestjs/bull';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { commentFactory } from './factories/comment';
import { repositoryRequestBody } from './factories/repository';
import { userRequestBody } from './factories/user';
import { CommentLevel, CommentStatus } from '@/types';
import { CreateCommentDto } from '@/src/comments/dto/create-comment-dto';
import { CommentQueueJobs } from '@/src/comments/comments.processor';

const seedTestDb = async () => {
  const userRequest = userRequestBody.build();
  const { password, ...userRequestWithoutPassword } = userRequest;
  const createUserDto = {
    ...userRequestWithoutPassword,
    password_digest: hashPassword(password),
  };

  const user = (await db('users').insert(createUserDto).returning(['id']))[0];

  const createRepositoryDto = repositoryRequestBody.build({ user_id: user.id });

  const repository = (
    await db('repositories').insert(createRepositoryDto).returning(['id'])
  )[0];

  return {
    repositoryID: repository.id,
  };
};

describe('Comment creation', () => {
  let accessToken: string;
  let moduleFixture: TestingModule;
  let app: INestApplication;
  let appServer: Express.Application;
  let repositoryID: number;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
        BullModule.forRoot({
          redis: process.env.REDIS_URL,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    appServer = app.getHttpServer();

    const jwtService = moduleFixture.get(JwtService);

    accessToken = jwtService.sign({ id: 1 }, { expiresIn: '15m' });

    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    await db.migrate.latest();
    const metaData = await seedTestDb();

    repositoryID = metaData.repositoryID;
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  afterAll(async () => {
    const memoryStoreClient = await memoryStore;

    await memoryStoreClient.flushDb();
    await memoryStoreClient.quit();
    await db.destroy();
    await app.close();
  });

  test('An unauthenticated user cannot access the create comments endpoint', async () => {
    const res = await request(appServer).get('/v1/comments');
    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('You are not authorized to access this resource');
  });

  describe('Authenticated user', () => {
    test('An authenticated user can create comments', async () => {
      const requestBody = commentFactory.build(
        {
          repository_id: repositoryID,
          content: 'Test comment',
        },
        {
          transient: { type: 'dto' },
        },
      );

      const res = await request(appServer)
        .post('/v1/comments')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(requestBody);

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.CREATED);
      expect(body.status).toBe('success');
      expect(body.data).toMatchObject({
        id: expect.any(Number),
        content: 'Test comment',
        start_line: requestBody.start_line,
        end_line: requestBody.end_line,
        level: requestBody.level,
        status: requestBody.status,
        user_id: 1,
        repository_id: repositoryID,
        snippet: requestBody.snippet,
        file_path: requestBody.file_path,
      });
    });

    test('Comment creation fails if level is not provided', async () => {
      const requestBody = commentFactory.build(
        {},
        { transient: { omit: ['level'] } },
      );
      const res = await request(appServer)
        .post('/v1/comments')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(requestBody);

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        level: 'No level provided',
      });
    });

    test('Comment creation fails if level is not a supported level type', async () => {
      const requestBody = commentFactory.build({
        level: 'invalid' as CommentLevel,
      });
      const res = await request(appServer)
        .post('/v1/comments')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(requestBody);

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        level: 'Level is not valid. Level must be one of [LINE,FILE,PROJECT]',
      });
    });

    test('Comment creation fails if status is not a supported status type', async () => {
      const requestBody = commentFactory.build({
        status: 'invalid' as CommentStatus,
      });
      const res = await request(appServer)
        .post('/v1/comments')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(requestBody);

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        status:
          'Status is not valid. Status must be one of [PENDING,PUBLISHED,RESOLVED]',
      });
    });

    test('Comment creation fails if repository_id is not provided', async () => {
      const requestBody = commentFactory.build(
        {},
        { transient: { omit: ['repository_id'] } },
      );
      const res = await request(appServer)
        .post('/v1/comments')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(requestBody);

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        repository_id: 'No repository_id provided',
      });
    });

    describe('Line level comments', () => {
      test('User can create line-level comment', async () => {
        const requestBody = commentFactory.build({
          repository_id: repositoryID,
          file_path: 'test.txt',
          snippet: 'Test snippet',
          start_line: 1,
          end_line: 2,
          content: 'Test comment',
          level: CommentLevel.LINE,
        });
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body.status).toBe('success');
        expect(body.data).toMatchObject({
          id: expect.any(Number),
          repository_id: repositoryID,
          file_path: 'test.txt',
          snippet: 'Test snippet',
          start_line: 1,
          end_line: 2,
          content: 'Test comment',
          status: CommentStatus.PENDING,
        });
      });

      test('Comment is not created if content is not present', async () => {
        const requestBody = commentFactory.build(
          {
            level: CommentLevel.LINE,
          },
          { transient: { omit: ['content'] } },
        );
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          content: 'No content provided',
        });
      });

      test.each(['start_line', 'end_line', 'insertion_pos'])(
        'Comment is not created if %s is not present',
        async (field) => {
          const requestBody = commentFactory.build(
            {
              level: CommentLevel.LINE,
            },
            { transient: { omit: [field as keyof CreateCommentDto] } },
          );
          const res = await request(appServer)
            .post('/v1/comments')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(requestBody);

          const { body, statusCode } = res;

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body.status).toBe('fail');
          expect(body.data).toMatchObject({
            level:
              "start_line, end_line and insertion_pos must be provided when the comment level is set to 'LINE'",
          });
        },
      );

      test('Comment is not created if start_line is greater than end_line', async () => {
        const requestBody = commentFactory.build({
          level: CommentLevel.LINE,
          start_line: 2,
          end_line: 1,
        });
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          level: 'start_line must be less than or equal to end_line',
        });
      });

      test('Comment is not created if repository_id is not present', async () => {
        const requestBody = commentFactory.build(
          {
            level: CommentLevel.LINE,
          },
          { transient: { omit: ['repository_id'] } },
        );
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          repository_id: 'No repository_id provided',
        });
      });

      test.each(['snippet', 'file_path'])(
        'Comment is not created if %s is not present',
        async (field) => {
          const requestBody = commentFactory.build(
            {
              level: CommentLevel.LINE,
            },
            { transient: { omit: [field as keyof CreateCommentDto] } },
          );
          const res = await request(appServer)
            .post('/v1/comments')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send(requestBody);

          const { body, statusCode } = res;

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body.status).toBe('fail');
          expect(body.data).toMatchObject({
            level:
              "snippet and file_path must be specified when the comment level is 'LINE'",
          });
        },
      );
    });

    describe('File level comments', () => {
      test('User can create file-level comment', async () => {
        const requestBody = commentFactory.build(
          {
            repository_id: repositoryID,
            content: 'Test comment',
            level: CommentLevel.FILE,
          },
          { transient: { omit: ['snippet'] } },
        );

        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body.status).toBe('success');
        expect(body.data).toMatchObject({
          id: expect.any(Number),
          repository_id: repositoryID,
          file_path: requestBody.file_path,
          snippet: null,
          content: 'Test comment',
          status: CommentStatus.PENDING,
        });
      });

      test('Comment is not created if content is not present', async () => {
        const requestBody = commentFactory.build(
          {
            level: CommentLevel.FILE,
          },
          { transient: { omit: ['content'] } },
        );
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          content: 'No content provided',
        });
      });

      test('Comment is not created if file_path is not present', async () => {
        const requestBody = commentFactory.build(
          {
            level: CommentLevel.FILE,
          },
          { transient: { omit: ['file_path'] } },
        );
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          level: "file_path must be specified when the comment level is 'FILE'",
        });
      });
    });

    describe('Project level comments', () => {
      test('User can create project-level comment', async () => {
        const requestBody = commentFactory.build({
          repository_id: repositoryID,
          content: 'Test comment',
          level: CommentLevel.PROJECT,
        });

        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body.status).toBe('success');
        expect(body.data).toMatchObject({
          id: expect.any(Number),
          repository_id: repositoryID,
          file_path: null,
          snippet: null,
          content: 'Test comment',
          status: CommentStatus.PUBLISHED,
        });
      });

      test('Comment is not created if content is not present', async () => {
        const requestBody = commentFactory.build(
          {
            level: CommentLevel.PROJECT,
          },
          { transient: { omit: ['content'] } },
        );
        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(requestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          content: 'No content provided',
        });
      });

      test('Pending comments are set to published when a project-level comment is created', async () => {
        const lineLevelCommentRequestBody = commentFactory.build({
          repository_id: repositoryID,
          status: CommentStatus.PENDING,
          level: CommentLevel.LINE,
        });

        const fileLevelCommentRequestBody = commentFactory.build({
          repository_id: repositoryID,
          status: CommentStatus.PENDING,
          level: CommentLevel.FILE,
        });

        const projectLevelCommentRequestBody = commentFactory.build({
          repository_id: repositoryID,
          content: 'Test comment',
          level: CommentLevel.PROJECT,
        });

        const { body: lineLevelCommentResponseBody } = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(lineLevelCommentRequestBody);

        expect(lineLevelCommentResponseBody.data).toMatchObject({
          id: expect.any(Number),
          status: CommentStatus.PENDING,
          level: CommentLevel.LINE,
        });

        const { body: fileLevelCommentResponseBody } = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(fileLevelCommentRequestBody);

        expect(fileLevelCommentResponseBody.data).toMatchObject({
          id: expect.any(Number),
          status: CommentStatus.PENDING,
          level: CommentLevel.FILE,
        });

        const res = await request(appServer)
          .post('/v1/comments')
          .set('Cookie', [`accessToken=${accessToken}`])
          .send(projectLevelCommentRequestBody);

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(body.status).toBe('success');
        expect(body.data).toMatchObject({
          id: expect.any(Number),
          repository_id: repositoryID,
          file_path: null,
          snippet: null,
          content: 'Test comment',
          status: CommentStatus.PUBLISHED,
          level: CommentLevel.PROJECT,
        });

        const queue = moduleFixture.get('BullQueue_comments');
        const job = await queue.add(CommentQueueJobs.PUBLISH_REVIEW_COMMENTS, {
          user_id: body.data.user_id,
          review_summary_id: body.data.review_summary_id,
        });
        await job.finished();

        expect(queue).toBeDefined();
        expect(queue.name).toBe('comments');

        const pendingComments = await db('comments')
          .whereIn('id', [
            lineLevelCommentResponseBody.data.id,
            fileLevelCommentResponseBody.data.id,
          ])
          .select('status');

        pendingComments.forEach((comment) => {
          expect(comment.status).toBe(CommentStatus.PUBLISHED);
        });
      });
    });
  });
});
