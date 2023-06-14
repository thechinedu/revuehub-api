import { BATCH_INSERT_CHUNK_SIZE } from '@/utils/oauth';
import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

const sampleRepositoryContents = [
  {
    path: '.github',
    type: 'tree',
  },
  {
    path: '.github/workflows',
    type: 'tree',
  },
  {
    path: '__tests__',
    type: 'tree',
  },
  {
    path: 'db',
    type: 'tree',
  },
  {
    path: 'migrations',
    type: 'tree',
  },
  {
    path: 'src',
    type: 'tree',
  },
  {
    path: 'src/auth',
    type: 'tree',
  },
  {
    path: 'src/auth/dto',
    type: 'tree',
  },
  {
    path: 'src/auth/validators',
    type: 'tree',
  },
  {
    path: 'src/guards',
    type: 'tree',
  },
  {
    path: 'src/pipes',
    type: 'tree',
  },
  {
    path: 'src/repositories',
    type: 'tree',
  },
  {
    path: 'src/repositories/dto',
    type: 'tree',
  },
  {
    path: 'src/user-auth-tokens',
    type: 'tree',
  },
  {
    path: 'src/user-auth-tokens/dto',
    type: 'tree',
  },
  {
    path: 'src/users',
    type: 'tree',
  },
  {
    path: 'src/users/dto',
    type: 'tree',
  },
  {
    path: 'src/users/validators',
    type: 'tree',
  },
  {
    path: 'types',
    type: 'tree',
  },
  {
    path: 'utils',
    type: 'tree',
  },
  {
    path: 'utils/oauth',
    type: 'tree',
  },
  {
    path: 'utils/oauth/github-provider-strategy',
    type: 'tree',
  },
  {
    path: '.eslintrc.js',
    type: 'blob',
  },
  {
    path: '.github/dependabot.yml',
    type: 'blob',
  },
  {
    path: '.github/workflows/codeql-analysis.yml',
    type: 'blob',
  },
  {
    path: '.github/workflows/main.yml',
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
    path: '__tests__/signup.spec.ts',
    type: 'blob',
  },
  {
    path: 'db/index.ts',
    type: 'blob',
  },
  {
    path: 'knexfile.ts',
    type: 'blob',
  },
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
  {
    path: 'nest-cli.json',
    type: 'blob',
  },
  {
    path: 'package.json',
    type: 'blob',
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
  {
    path: 'src/auth/validators/login.validator.ts',
    type: 'blob',
  },
  {
    path: 'src/auth/validators/oauth-state.validator.ts',
    type: 'blob',
  },
  {
    path: 'src/guards/auth.ts',
    type: 'blob',
  },
  {
    path: 'src/main.ts',
    type: 'blob',
  },
  {
    path: 'src/pipes/validation.ts',
    type: 'blob',
  },
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
  {
    path: 'src/user-auth-tokens/dto/create-auth-token-dto.ts',
    type: 'blob',
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
  {
    path: 'src/users/dto/create-user-dto.ts',
    type: 'blob',
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
  {
    path: 'src/users/validators/create-oauth-user.validator.ts',
    type: 'blob',
  },
  {
    path: 'src/users/validators/create-user.validator.ts',
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
    path: 'types/index.ts',
    type: 'blob',
  },
  {
    path: 'utils/auth.ts',
    type: 'blob',
  },
  {
    path: 'utils/index.ts',
    type: 'blob',
  },
  {
    path: 'utils/oauth/generate-oauth-state.ts',
    type: 'blob',
  },
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
  {
    path: 'utils/oauth/index.ts',
    type: 'blob',
  },
  {
    path: 'utils/oauth/oauth-provider.ts',
    type: 'blob',
  },
  {
    path: 'yarn.lock',
    type: 'blob',
  },
];

function getRepositoryContentsDto(repository_id: number) {
  return sampleRepositoryContents.map(({ path, type }) => ({
    repository_id,
    path,
    type,
    sha: faker.string.uuid(),
  }));
}

export async function seed(knex: Knex): Promise<void> {
  await knex('repository_contents').del();

  const repository = await knex('repositories').select(['id']).first();

  await knex.batchInsert(
    'repository_contents',
    getRepositoryContentsDto(repository.id),
    BATCH_INSERT_CHUNK_SIZE,
  );
}
