import { db } from '@/db';
import { AppModule } from '@/src/app.module';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';

describe('Fetch repo by name', () => {
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

  test('An unauthenticated user cannot access the fetchRepoByName endpoint', async () => {
    const res = await request(appServer).get(
      '/v1/repositories/thechinedu/revuehub-api',
    );
    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('You are not authorized to access this resource');
  });

  test('An authenticated user can access the fetchRepoByName endpoint', async () => {
    const res = await request(appServer)
      .get('/v1/repositories/thechinedu/revuehub-api')
      .set('Cookie', [`accessToken=${accessToken}`]);

    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.OK);
    expect(body.status).toBe('success');
    expect(body.data).toEqual({
      id: 1,
      name: 'thechinedu/revuehub-api',
      default_branch: 'main',
      description:
        'Review Github repositories without the need for pull requests',
    });
  });

  test('A 404 is returned if the given repo name is non-existent', async () => {
    const res = await request(appServer)
      .get('/v1/repositories/thechinedu/demo-repo')
      .set('Cookie', [`accessToken=${accessToken}`]);

    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('No repository with the given name was found');
  });
});
