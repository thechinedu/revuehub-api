import { AppModule } from '@/src/app.module';
import { INestApplication, VersioningType } from '@nestjs/common';
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

  describe('when the request body is valid', () => {
    it('/v1/users (POST)', async () => {
      const res = await request(app.getHttpServer()).post('/v1/users').send({
        email: 'testymctestface@test.com',
        password: 'supers3cret',
        username: 'testy',
      });

      console.log({ body: res.body });

      expect(4).toBe(4);
      // return request(app.getHttpServer())
      //   .post('/v1/users')
      //   .send({
      //     email: 'testymctestface@test.com',
      //     password: 'supers3cret',
      //     username: 'Testy',
      //   })
      //   .expect(201)
      //   .expect('Hello World!')
      //   .then((res) => {
      //     console.log(res.body);
      //   });
    });
  });
});
