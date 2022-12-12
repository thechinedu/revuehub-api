import { db, memoryStore } from '@/db';
import { AppModule } from '@/src/app.module';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';

describe('Fetch repo by name', () => {
  let app: INestApplication;
  const requestBody = {
    email: 'testymctestface@test.com',
    username: 'testy',
    password: 'mein passwort ist super',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const jwtService = moduleFixture.get(JwtService);
    console.log({ jwtService });
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    await db.migrate.latest();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  afterAll(async () => {
    const memoryStoreClient = await memoryStore;

    app.close();
    db.destroy();
    memoryStoreClient.disconnect();
  });

  test('An unauthenticated user cannot access the fetchRepoByName endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/repositories/thechinedu/revuehub-api')
      .set('Cookie', ['accessToken=1;']);
    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('You are not authorized to access this resource');
  });

  // test('An authenticated user can access the fetchRepoByName endpoint', async () => {
  //   await db.seed.run();
  // });
});
