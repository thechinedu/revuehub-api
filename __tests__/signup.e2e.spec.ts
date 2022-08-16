import { AppModule } from '@/src/app.module';
import { db } from '@/db';
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

  afterAll(() => {
    app.close();
    db.destroy();
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
          value: null,
          message: 'No email address provided',
        },
        {
          value: '',
          message: 'Email address cannot be empty',
        },
      ],
    },
    {
      key: 'username',
      properties: [
        { value: null, message: 'No username provided' },
        {
          value: '',
          message: 'Username cannot be empty',
        },
      ],
    },
  ])(
    'User signup is disallowed when $key is invalid',
    ({ key, properties }) => {
      test(`when ${key} is not provided`, async () => {
        const res = await request(app.getHttpServer())
          .post('/v1/users')
          .send({ ...requestBody, [key]: properties[0].value });

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          [key]: properties[0].message,
        });
      });

      test(`when ${key} is empty`, async () => {
        const res = await request(app.getHttpServer())
          .post('/v1/users')
          .send({ ...requestBody, [key]: properties[1].value });

        const { body, statusCode } = res;

        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.status).toBe('fail');
        expect(body.data).toMatchObject({
          [key]: properties[1].message,
        });
      });
    },
  );

  xdescribe('User signup is disallowed when email is invalid', () => {
    // test('When email is not provided', async () => {
    //   const res = await request(app.getHttpServer())
    //     .post('/v1/users')
    //     .send({ ...requestBody, email: null });

    //   const { body, statusCode } = res;

    //   expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    //   expect(body.status).toBe('fail');
    //   expect(body.data).toMatchObject({
    //     email: 'No email address provided',
    //   });
    // });

    // test('When email is empty', async () => {
    //   const res = await request(app.getHttpServer())
    //     .post('/v1/users')
    //     .send({ ...requestBody, email: '' });

    //   const { body, statusCode } = res;

    //   expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    //   expect(body.status).toBe('fail');
    //   expect(body.data).toMatchObject({
    //     email: 'Email address cannot be empty',
    //   });
    // });

    test('when email is already in use by another user', () => {});
  });

  xdescribe('User signup is disallowed when username is invalid', () => {
    test('When username is not provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/users')
        .send({ ...requestBody, username: null });

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        username: 'No username provided',
      });
    });

    test('When username is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/users')
        .send({ ...requestBody, username: '' });

      const { body, statusCode } = res;

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.status).toBe('fail');
      expect(body.data).toMatchObject({
        username: 'Username cannot be empty',
      });
    });
  });
});
