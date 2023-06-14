import { CreateRepositoryDto } from '@/src/repositories/dto/create-repository-dto';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const repositoryRequestBody = Factory.define<CreateRepositoryDto>(
  ({
    params: {
      name = faker.company.buzzNoun(),
      description = faker.company.buzzPhrase(),
      user_id = faker.number.int({ max: 10000 }),
      snapshot_id = faker.number.int({ max: 10000 }),
      node_id = faker.string.uuid(),
      last_updated = faker.date.anytime(),
      default_branch = 'main',
    },
  }) => ({
    name,
    user_id,
    default_branch,
    description,
    snapshot_id,
    last_updated,
    node_id,
  }),
);
