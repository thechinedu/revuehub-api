import { CreateRepositoryBlobDto } from '@/src/repositories/dto/create-repository-blob-dto';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const repositoryBlobRequestBody =
  Factory.define<CreateRepositoryBlobDto>(
    ({
      params: {
        content = Buffer.from(faker.lorem.text()).toString('base64'),
        repository_content_id = faker.number.int({ max: 10000 }),
      },
    }) => ({
      content,
      repository_content_id,
    }),
  );
