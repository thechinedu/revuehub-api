import { db } from '@/db';
import { Validator } from '@/utils';
import Joi, { ValidationErrorItem } from 'joi';

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
        [{ [field]: `${value} is not available` }],
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
});

const emailValidationMessages = {
  'string.email': { email: 'The provided email address is not valid.' },
  'any.required': { email: 'No email address provided.' },
};

const usernameValidationMessages = {
  'string.pattern.base': {
    username:
      'Username can only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
  },
  'any.required': { username: 'No username provided.' },
};

const passwordValidationMessages = {
  'string.min': { password: 'Password should be a minimum of 8 characters.' },
  'any.required': { password: 'No password provided.' },
};

const beforeValidate = (createUserDto: CreateUserDto) => ({
  ...createUserDto,
  email: createUserDto.email?.toLowerCase(),
  username: createUserDto.username?.toLowerCase(),
});

export const createUserValidator: Validator<CreateUserDto> = {
  schema,
  beforeValidate,
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => {
    const actions = {
      email: emailValidationMessages,
      username: usernameValidationMessages,
      password: passwordValidationMessages,
    };
    const acc = {};

    errorDetails.forEach((details) => {
      const { context, type } = details;
      const messageRecord = actions[context?.key]?.[type] || details;

      Object.assign(acc, messageRecord);
    });

    return { data: acc };
  },
};
