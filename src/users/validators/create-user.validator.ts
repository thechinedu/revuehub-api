import { db } from '@/db';
import { Validator } from '@/utils';
import Joi from 'joi';

import { CreateUserDto } from '../dto/create-user-dto';

const { object, string } = Joi.types();

const validateUniqueness =
  (field: 'email' | 'username') => async (value: string) => {
    const res = await db('users').where(field, value);

    if (res.length) {
      throw new Joi.ValidationError(
        'Not unique',
        [{ message: `${field} ${value} is not available` }],
        () => null,
      );
    }

    return value;
  };

export const schema: Joi.ObjectSchema<CreateUserDto> = object.keys({
  email: string
    .email()
    .required()
    .external(
      validateUniqueness('email'),
      'Check that the provided email is unique',
    ),
  username: string
    .pattern(/^[a-z0-9]+[a-z0-9\-]*$/)
    .required()
    .external(
      validateUniqueness('username'),
      'Check that the provided username is unique',
    ),
  password: string.min(8).alphanum().required(),
  full_name: string,
});

const beforeValidate = (createUserDto: CreateUserDto) => ({
  ...createUserDto,
  email: createUserDto.email?.toLowerCase(),
  username: createUserDto.username?.toLowerCase(),
});

export const createUserValidator: Validator<CreateUserDto> = {
  schema,
  beforeValidate,
};
