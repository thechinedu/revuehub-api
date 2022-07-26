import { hashPassword, Validator } from '@/utils';
import Joi from 'joi';

import { CreateUserDto } from '../dto/create-user-dto';

const { object, string } = Joi.types();

const validateEmailUniqueness = (value: string) => {
  return value;
};

export const schema: Joi.ObjectSchema<CreateUserDto> = object.keys({
  email: string
    .email()
    .required()
    .external(validateEmailUniqueness, 'Check that provided email is unique'),
  username: string.required(),
  password: string.min(8).alphanum().required(),
  full_name: string,
});

const beforeValidate = (createUserDto: CreateUserDto) => ({
  ...createUserDto,
  email: createUserDto.email?.toLowerCase(),
  username: createUserDto.username?.toLowerCase(),
});

const afterValidate = async ({ password, ...dto }: CreateUserDto) => ({
  ...dto,
  password_digest: await hashPassword(password),
});

export const createUserValidator: Validator<CreateUserDto> = {
  schema,
  beforeValidate,
  afterValidate,
};
