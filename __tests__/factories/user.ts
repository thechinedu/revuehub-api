import { CreateUserDto } from '@/src/users/dto/create-user-dto';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const userRequestBody = Factory.define<CreateUserDto>(
  ({
    params: {
      email = faker.internet.email(),
      username = faker.internet.userName(),
      password = faker.internet.password(),
    },
  }) => ({
    email,
    username,
    password,
  }),
);
