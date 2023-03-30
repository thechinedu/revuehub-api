import { db } from '@/db';
import { AppModule } from '@/src/app.module';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';

const repoContentsResponse = [
  {
    path: '.github',
    type: 'tree',
    contents: [
      {
        path: '.github/workflows',
        type: 'tree',
        contents: [
          {
            path: '.github/workflows/codeql-analysis.yml',
            type: 'blob',
          },
          {
            path: '.github/workflows/main.yml',
            type: 'blob',
          },
        ],
      },
      {
        path: '.github/dependabot.yml',
        type: 'blob',
      },
    ],
  },
  {
    path: '__tests__',
    type: 'tree',
    contents: [
      {
        path: '__tests__/signup.spec.ts',
        type: 'blob',
      },
    ],
  },
  {
    path: 'db',
    type: 'tree',
    contents: [
      {
        path: 'db/index.ts',
        type: 'blob',
      },
    ],
  },
  {
    path: 'migrations',
    type: 'tree',
    contents: [
      {
        path: 'migrations/20220707070815_create_users.ts',
        type: 'blob',
      },
      {
        path: 'migrations/20220907074617_user_auth_tokens.ts',
        type: 'blob',
      },
      {
        path: 'migrations/20221005060124_create_repositories.ts',
        type: 'blob',
      },
      {
        path: 'migrations/20221005063856_create_repository_branches.ts',
        type: 'blob',
      },
      {
        path: 'migrations/20221114203456_create_repository_contents.ts',
        type: 'blob',
      },
      {
        path: 'migrations/20221116085227_create_repository_blobs.ts',
        type: 'blob',
      },
    ],
  },
  {
    path: 'src',
    type: 'tree',
    contents: [
      {
        path: 'src/auth',
        type: 'tree',
        contents: [
          {
            path: 'src/auth/dto',
            type: 'tree',
            contents: [
              {
                path: 'src/auth/dto/create-oauth-state-dto.ts',
                type: 'blob',
              },
              {
                path: 'src/auth/dto/create-user-from-oauth-dto.ts',
                type: 'blob',
              },
              {
                path: 'src/auth/dto/user-credentials-dto.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'src/auth/validators',
            type: 'tree',
            contents: [
              {
                path: 'src/auth/validators/login.validator.ts',
                type: 'blob',
              },
              {
                path: 'src/auth/validators/oauth-state.validator.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'src/auth/auth.controller.ts',
            type: 'blob',
          },
          {
            path: 'src/auth/auth.module.ts',
            type: 'blob',
          },
          {
            path: 'src/auth/auth.service.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'src/guards',
        type: 'tree',
        contents: [
          {
            path: 'src/guards/auth.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'src/pipes',
        type: 'tree',
        contents: [
          {
            path: 'src/pipes/validation.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'src/repositories',
        type: 'tree',
        contents: [
          {
            path: 'src/repositories/dto',
            type: 'tree',
            contents: [
              {
                path: 'src/repositories/dto/create-repository-blob-dto.ts',
                type: 'blob',
              },
              {
                path: 'src/repositories/dto/create-repository-dto.ts',
                type: 'blob',
              },
              {
                path: 'src/repositories/dto/repository-contents-dto.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'src/repositories/repositories.controller.ts',
            type: 'blob',
          },
          {
            path: 'src/repositories/repositories.module.ts',
            type: 'blob',
          },
          {
            path: 'src/repositories/repository-blob.model.ts',
            type: 'blob',
          },
          {
            path: 'src/repositories/repository-content.model.ts',
            type: 'blob',
          },
          {
            path: 'src/repositories/repository.model.ts',
            type: 'blob',
          },
          {
            path: 'src/repositories/repository.service.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'src/user-auth-tokens',
        type: 'tree',
        contents: [
          {
            path: 'src/user-auth-tokens/dto',
            type: 'tree',
            contents: [
              {
                path: 'src/user-auth-tokens/dto/create-auth-token-dto.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'src/user-auth-tokens/user-auth-token.model.ts',
            type: 'blob',
          },
          {
            path: 'src/user-auth-tokens/user-auth-token.module.ts',
            type: 'blob',
          },
          {
            path: 'src/user-auth-tokens/user-auth-token.service.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'src/users',
        type: 'tree',
        contents: [
          {
            path: 'src/users/dto',
            type: 'tree',
            contents: [
              {
                path: 'src/users/dto/create-user-dto.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'src/users/validators',
            type: 'tree',
            contents: [
              {
                path: 'src/users/validators/create-oauth-user.validator.ts',
                type: 'blob',
              },
              {
                path: 'src/users/validators/create-user.validator.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'src/users/user.model.ts',
            type: 'blob',
          },
          {
            path: 'src/users/user.serializer.ts',
            type: 'blob',
          },
          {
            path: 'src/users/user.service.ts',
            type: 'blob',
          },
          {
            path: 'src/users/users.controller.ts',
            type: 'blob',
          },
          {
            path: 'src/users/users.module.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'src/app.controller.spec.ts',
        type: 'blob',
      },
      {
        path: 'src/app.controller.ts',
        type: 'blob',
      },
      {
        path: 'src/app.module.ts',
        type: 'blob',
      },
      {
        path: 'src/app.service.ts',
        type: 'blob',
      },
      {
        path: 'src/main.ts',
        type: 'blob',
      },
    ],
  },
  {
    path: 'types',
    type: 'tree',
    contents: [
      {
        path: 'types/index.ts',
        type: 'blob',
      },
    ],
  },
  {
    path: 'utils',
    type: 'tree',
    contents: [
      {
        path: 'utils/oauth',
        type: 'tree',
        contents: [
          {
            path: 'utils/oauth/github-provider-strategy',
            type: 'tree',
            contents: [
              {
                path: 'utils/oauth/github-provider-strategy/get-repo-contents.ts',
                type: 'blob',
              },
              {
                path: 'utils/oauth/github-provider-strategy/get-repo-file-content.ts',
                type: 'blob',
              },
              {
                path: 'utils/oauth/github-provider-strategy/get-user-info.ts',
                type: 'blob',
              },
              {
                path: 'utils/oauth/github-provider-strategy/get-user-repos.ts',
                type: 'blob',
              },
              {
                path: 'utils/oauth/github-provider-strategy/index.ts',
                type: 'blob',
              },
            ],
          },
          {
            path: 'utils/oauth/generate-oauth-state.ts',
            type: 'blob',
          },
          {
            path: 'utils/oauth/index.ts',
            type: 'blob',
          },
          {
            path: 'utils/oauth/oauth-provider.ts',
            type: 'blob',
          },
        ],
      },
      {
        path: 'utils/auth.ts',
        type: 'blob',
      },
      {
        path: 'utils/index.ts',
        type: 'blob',
      },
    ],
  },
  {
    path: '.eslintrc.js',
    type: 'blob',
  },
  {
    path: '.gitignore',
    type: 'blob',
  },
  {
    path: '.prettierrc',
    type: 'blob',
  },
  {
    path: 'README.md',
    type: 'blob',
  },
  {
    path: 'knexfile.ts',
    type: 'blob',
  },
  {
    path: 'nest-cli.json',
    type: 'blob',
  },
  {
    path: 'package.json',
    type: 'blob',
  },
  {
    path: 'tsconfig.build.json',
    type: 'blob',
  },
  {
    path: 'tsconfig.json',
    type: 'blob',
  },
  {
    path: 'yarn.lock',
    type: 'blob',
  },
];

describe('Fetch repo contents', () => {
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

  afterAll(async () => {
    db.destroy();
    app.close();
  });

  test('An unauthenticated user cannot access the fetchRepoContents endpoint', async () => {
    const res = await request(appServer).get('/v1/repositories/1/contents');
    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('You are not authorized to access this resource');
  });

  test('An authenticated user can access the fetchRepoContents endpoint', async () => {
    const res = await request(appServer)
      .get('/v1/repositories/1/contents')
      .set('Cookie', [`accessToken=${accessToken}`]);

    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.OK);
    expect(body.status).toBe('success');
    expect(body.data).toMatchObject(repoContentsResponse);
  });

  test('A 404 is returned if the given repo id is non-existent', async () => {
    const res = await request(appServer)
      .get('/v1/repositories/140/contents')
      .set('Cookie', [`accessToken=${accessToken}`]);

    const { body, statusCode } = res;

    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body.status).toBe('fail');
    expect(body.message).toBe('No content found for the given repository');
  });
});
