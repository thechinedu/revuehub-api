import { db } from '@/db';
import { AppModule } from '@/src/app.module';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';

describe('Fetch repo blob file', () => {
  let app: INestApplication;
  let accessToken: string;
  let appServer: Express.Application;

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
    await db.seed.run();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  afterAll(() => {
    db.destroy();
    app.close();
  });

  test('An unauthenticated user cannot access the fetchRepoBlobFile endpoint', async () => {
    const res = await request(appServer).get('/v1/repositories/1/contents/1');
    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('You are not authorized to access this resource');
  });

  test('An authenticated user can access the fetchRepoBlobFile endpoint', async () => {
    const res = await request(appServer)
      .get('/v1/repositories/1/contents/23')
      .set('Cookie', [`accessToken=${accessToken}`]);

    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.OK);
    expect(body.status).toBe('success');
    expect(body.data).toEqual({
      content: 'hello',
    });
  });
});
