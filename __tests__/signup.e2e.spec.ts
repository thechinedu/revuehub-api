import { AppModule } from '@/src/app.module';
import { db } from '@/db';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('User signup', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  beforeEach(async () => {
    await db.migrate.latest();
  });

  afterEach(async () => {
    await db.migrate.rollback();
  });

  afterAll(() => {
    app.close();
    db.destroy();
  });

  describe('when the request body is valid', () => {
    it('/v1/users (POST)', async () => {
      const res = await request(app.getHttpServer()).post('/v1/users').send({
        email: 'testymctestface@test.com',
        password: 'mein passwort ist super',
        username: 'testy',
      });

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.CREATED);
      expect(body.status).toBe('success');
    });
  });
});
