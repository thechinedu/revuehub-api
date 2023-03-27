import { db, memoryStore } from '@/db';
import { AppModule } from '@/src/app.module';
import { hashPassword } from '@/utils';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { commentRequestBody } from './factories/comment';
import { repositoryRequestBody } from './factories/repository';
import { userRequestBody } from './factories/user';

// function getRepositoryBlobDto(repository_content_id: number) {
//   return {
//     repository_content_id,
//     content: 'aGVsbG8=',
//   };
// }

// export async function seed(knex: Knex): Promise<void> {
//   await knex('repository_blobs').del();
//   const repositoryContent = await knex('repository_contents')
//     .where({ type: 'blob' })
//     .select(['id'])
//     .first();

//   await knex('repository_blobs').insert(
//     getRepositoryBlobDto(repositoryContent.id),
//   );
// }

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
  let app: INestApplication;
  let appServer: Express.Application;
  let repositoryID: number;

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
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  afterAll(async () => {
    const memoryStoreClient = await memoryStore;

    db.destroy();
    app.close();
    memoryStoreClient.disconnect();
  });

  test('An unauthenticated user cannot access the create comments endpoint', async () => {
    const res = await request(appServer).get('/v1/comments');
    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('You are not authorized to access this resource');
  });

  describe('Authenticated user', () => {
    test.skip('User can create line-level comment', async () => {
      const requestBody = commentRequestBody.build({
        repository_id: repositoryID,
        start_line: 1,
        end_line: 2,
      });
      const res = await request(appServer)
        .post('/v1/comments')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(requestBody);

      const { body, statusCode } = res;

      console.log({ body });

      expect(statusCode).toBe(HttpStatus.CREATED);
    });
  });
});
