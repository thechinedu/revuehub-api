import { CreateRepositoryDto } from '@/src/repositories/dto/create-repository-dto';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const repositoryRequestBody = Factory.define<CreateRepositoryDto>(
  ({
    params: {
      name = faker.company.bsNoun(),
      description = faker.company.bs(),
      user_id = faker.datatype.number(),
      snapshot_id = faker.datatype.number(),
      node_id = faker.datatype.uuid(),
      last_updated = faker.datatype.datetime(),
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
