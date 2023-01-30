import { db, memoryStore } from '@/db';
import { AppModule } from '@/src/app.module';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('User signup', () => {
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

  afterAll(async () => {
    const memoryStoreClient = await memoryStore;

    db.destroy();
    app.close();
    memoryStoreClient.disconnect();
  });

  test('A new user is created when the request body is valid', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/users')
      .send(requestBody);

    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body.status).toBe('success');
    expect(body.data).toMatchObject({
      id: 1,
      email: 'testymctestface@test.com',
      email_verified: false,
      username: 'testy',
    });
  });

  describe.each([
    {
      key: 'email',
      properties: [
        {
          message: 'No email address provided',
        },
        {
          message: 'Email address cannot be empty',
        },
        {
          message: `The provided email address is not available`,
          overrideField: 'username',
          overrideValue: 'testy-testy',
        },
      ],
    },
    {
      key: 'username',
      properties: [
        { message: 'No username provided' },
        {
          message: 'Username cannot be empty',
        },
        {
          message: `The provided username is not available`,
          overrideField: 'email',
          overrideValue: 'testymctestface2@test.com',
        },
      ],
    },
    {
      key: 'password',
      properties: [
        { message: 'No password provided' },
        {
          message: 'Password cannot be empty',
        },
      ],
    },
  ])(
    'User signup is disallowed when $key is invalid',
    ({ key, properties }) => {
      test(`when ${key} is not provided`, async () => {
        const { message } = properties[0];
        const requestKey = key as keyof typeof requestBody;
        const tempPropValue = requestBody[requestKey];

        delete requestBody[requestKey];

        const res = await request(app.getHttpServer())
          .post('/v1/users')
          .send({ ...requestBody });

        requestBody[requestKey] = tempPropValue;

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          [key]: message,
        });
      });

      if (properties[1]) {
        test(`when ${key} is empty`, async () => {
          const { message } = properties[1];
          const res = await request(app.getHttpServer())
            .post('/v1/users')
            .send({ ...requestBody, [key]: '' });

          const { body, statusCode } = res;

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body.status).toBe('fail');
          expect(body.data).toMatchObject({
            [key]: message,
          });
        });
      }

      if (properties[2]) {
        test(`when ${key} is already in use by another user`, async () => {
          const { message, overrideField, overrideValue } = properties[2];
          await request(app.getHttpServer())
            .post('/v1/users')
            .send(requestBody);

          const res = await request(app.getHttpServer())
            .post('/v1/users')
            .send({
              ...requestBody,
              [key]: requestBody[key as keyof typeof requestBody],
              [overrideField as string]: overrideValue,
            });

          const { body, statusCode } = res;

          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(body.status).toBe('fail');
          expect(body.data).toMatchObject({
            [key]: message,
          });
        });
      }
    },
  );

  test.each(['testy', '@testy', 'testy-', 'testy@test', 'testy@123'])(
    "User signup is disallowed when email doesn't match expected pattern",
    async (email) => {
      const res = await request(app.getHttpServer())
        .post('/v1/users')
        .send({ ...requestBody, email });

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        email: 'The provided email address is not valid',
      });
    },
  );

  test.each([
    '123456789',
    'revue',
    'revueHub',
    'password123',
    'supers3cret',
    'REVUEHUBs',
    'zxcvbn',
    'qwerty',
    'abcdefgh',
  ])(
    'User signup is disallowed when password is insecure',
    async (password) => {
      const res = await request(app.getHttpServer())
        .post('/v1/users')
        .send({ ...requestBody, password });

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        password:
          'Password is not secure enough. Password should be a minimum of 8 characters including uppercase and lowercase letters, numbers and symbols',
      });
    },
  );
});
