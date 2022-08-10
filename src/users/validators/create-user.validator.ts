import { db } from '@/db';
import { Validator } from '@/utils';
import Joi from 'joi';

import { CreateUserDto } from '../dto/create-user-dto';

const { object, string } = Joi.types();

// TODO:
// Customise the message returned by Joi to user friendly messages
//  Loop over error.details
//  Modify the error message based on the type field
//  Return an object in the form { [field]: [error message] } for every error object in the error.details array

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
    .pattern(/^[a-z0-9](\-?[a-z0-9])*$/)
    .required()
    .external(
      validateUniqueness('username'),
      'Check that the provided username is unique',
    ),
  password: string.min(8).required(),
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
