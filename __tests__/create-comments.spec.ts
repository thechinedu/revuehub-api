import { db } from '@/db';
import { AppModule } from '@/src/app.module';
import { hashPassword } from '@/utils';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { commentRequestBody } from './factories/comment';
import { repositoryBlobRequestBody } from './factories/repository-blob';
import { repositoryContentRequestBody } from './factories/repository-content';
import { repositoryRequestBody } from './factories/repository';
import { userRequestBody } from './factories/user';
import { CommentLevel, CommentStatus } from '@/types';
import { CreateCommentDto } from '@/src/comments/dto/create-comment-dto';

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

  const createRepositoryContentsDto = repositoryContentRequestBody.build({
    repository_id: repository.id,
  });

  const repositoryContent = (
    await db('repository_contents')
      .insert(createRepositoryContentsDto)
      .returning(['id'])
  )[0];

  const createRepositoryBlobDto = repositoryBlobRequestBody.build({
    repository_content_id: repositoryContent.id,
  });

  const repositoryBlob = (
    await db('repository_blobs')
      .insert(createRepositoryBlobDto)
      .returning(['id'])
  )[0];

  return {
    repositoryID: repository.id,
    repositoryContentID: repositoryContent.id,
    repositoryBlobID: repositoryBlob.id,
  };
};

describe('Comment creation', () => {
  let accessToken: string;
  let app: INestApplication;
  let appServer: Express.Application;
  let repositoryID: number;
  let repositoryContentID: number;
  let repositoryBlobID: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
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
    repositoryContentID = metaData.repositoryContentID;
    repositoryBlobID = metaData.repositoryBlobID;
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  afterAll(() => {
    db.destroy();
    app.close();
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
      const requestBody = commentRequestBody.build({
        repository_id: repositoryID,
        repository_content_id: repositoryContentID,
        repository_blob_id: repositoryBlobID,
        content: 'Test comment',
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
        content: 'Test comment',
        start_line: requestBody.start_line,
        end_line: requestBody.end_line,
        level: requestBody.level,
        status: requestBody.status,
        user_id: 1,
        repository_id: repositoryID,
        repository_content_id: repositoryContentID,
        repository_blob_id: repositoryBlobID,
      });
    });

    test('Comment creation fails if level is not provided', async () => {
      const requestBody = commentRequestBody.build(
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
      const requestBody = commentRequestBody.build({
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
      const requestBody = commentRequestBody.build({
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

    describe('Line level comments', () => {
      test('User can create line-level comment', async () => {
        const requestBody = commentRequestBody.build({
          repository_id: repositoryID,
          repository_content_id: repositoryContentID,
          repository_blob_id: repositoryBlobID,
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
          repository_content_id: repositoryContentID,
          repository_blob_id: repositoryBlobID,
          start_line: 1,
          end_line: 2,
          content: 'Test comment',
          status: CommentStatus.PENDING,
        });
      });

      test('Comment is not created if content is not present', async () => {
        const requestBody = commentRequestBody.build(
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
          const requestBody = commentRequestBody.build(
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
        const requestBody = commentRequestBody.build({
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
        const requestBody = commentRequestBody.build(
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

      test.each(['repository_blob_id', 'repository_content_id'])(
        'Comment is not created if %s is not present',
        async (field) => {
          const requestBody = commentRequestBody.build(
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
              "repository_blob_id and repository_content_id must be specified when the comment level is 'LINE'",
          });
        },
      );
    });

    describe.skip('File level comments', () => {
      test('User can create file-level comment', async () => {
        const requestBody = commentRequestBody.build(
          {
            repository_id: repositoryID,
            repository_content_id: repositoryContentID,
            content: 'Test comment',
            level: CommentLevel.FILE,
          },
          { transient: { omit: ['repository_blob_id'] } },
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
          repository_content_id: repositoryContentID,
          repository_blob_id: repositoryBlobID,
          content: 'Test comment',
          status: CommentStatus.PENDING,
        });
      });

      test('Comment is not created if content is not present', async () => {
        const requestBody = commentRequestBody.build(
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

      test.each(['repository_blob_id', 'repository_content_id'])(
        'Comment is not created if %s is not present',
        async (field) => {
          const requestBody = commentRequestBody.build(
            {
              level: CommentLevel.FILE,
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
              "repository_blob_id and repository_content_id must be specified when the comment level is 'FILE'",
          });
        },
      );
    });
  });
});
