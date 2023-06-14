import { CreateRepositoryContentsDto } from '@/src/repositories/dto/create-repository-contents-dto';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const repositoryContentRequestBody =
  Factory.define<CreateRepositoryContentsDto>(
    ({
      params: {
        path = '',
        repository_id = faker.number.int({ max: 10000 }),
        sha = faker.git.commitSha(),
        type = 'tree',
      },
    }) => ({
      path,
      repository_id,
      sha,
      type,
    }),
  );
