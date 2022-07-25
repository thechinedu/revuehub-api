import type { Validator } from '@/utils';
import Joi from 'joi';
import { CreateUserDto } from '../dto/create-user-dto';

const { object, string } = Joi.types();

export const schema = object.keys({
  email: string.email().required(),
  username: string.required(),
  password: string.min(8).required(),
  fullName: string,
});

const beforeValidate = (createUserDto) => {
  return;
};

const afterValidate = (createUserDto) => {
  return;
};

export const createUserValidator: Validator<CreateUserDto> = {
  schema,
  beforeValidate,
  afterValidate,
};
