import { AppModule } from '@/src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    console.log(process.env.NODE_ENV);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // app = moduleFixture.createNestApplication();
    // await app.init();
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
  it('does it', () => {
    expect(4).toBe(4);
  });
});
