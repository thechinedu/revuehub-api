import { db } from '@/db';
import { Validator } from '@/src/pipes/validation';
import { dtoValidationErrorMessageSerializer } from '@/utils';
import Joi, { CustomValidator, ExternalValidationFunction } from 'joi';
import zxcvbn from 'zxcvbn';

import { CreateUserDto } from '../dto/create-user-dto';

const { object, string } = Joi.types();

const validateUniqueness: (
  field: 'email' | 'username',
) => ExternalValidationFunction = (field) => async (value: string) => {
  const res = await db('users').where(field, value);

  if (res.length) {
    // TODO: Replace with custom error
    throw new Joi.ValidationError(
      'Not unique',
      [
        {
          [field]: `${value} is not available`,
          message: '',
          path: [],
          type: '',
        },
      ],
      () => null,
    );
  }

  return value;
};

const validatePasswordStrength: CustomValidator<string> = (value, helpers) => {
  const VALID_PASSWORD_SCORE = 4;
  const {
    state: { ancestors },
  } = helpers;
  const { email = '', username = '' } = ancestors?.[0];
  const disallowedValues = [email, username];
  const passwordStrength = zxcvbn(value, disallowedValues);

  if (passwordStrength.score < VALID_PASSWORD_SCORE) {
    return helpers.error('any.invalid');
  }

  return value;
};

export const schema: Joi.ObjectSchema<CreateUserDto> = object.keys({
  email: string.email().required().external(validateUniqueness('email')),
  username: string
    .pattern(/^[a-z0-9](\-?[a-z0-9])*$/)
    .required()
    .external(validateUniqueness('username')),
  password: string.min(8).required().custom(validatePasswordStrength),
});

const emailValidationMessages = {
  'string.email': { email: 'The provided email address is not valid' },
  'string.empty': { email: 'Email address cannot be empty' },
  'any.required': { email: 'No email address provided' },
};

const usernameValidationMessages = {
  'string.pattern.base': {
    username:
      'Username can only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen',
  },
  'string.empty': { username: 'Username cannot be empty' },
  'any.required': { username: 'No username provided' },
};

const passwordValidationMessages = {
  'string.min': { password: 'Password should be a minimum of 8 characters' },
  'string.empty': { password: 'Password cannot be empty' },
  'any.required': { password: 'No password provided' },
  'string.base': { password: 'Password must be a string' },
  'any.invalid': {
    password:
      'Password is not secure enough. Password should be a minimum of 8 characters including uppercase and lowercase letters, numbers and symbols',
  },
};

const messages = {
  email: emailValidationMessages,
  username: usernameValidationMessages,
  password: passwordValidationMessages,
};

const beforeValidate = (createUserDto: CreateUserDto) =>
  Promise.resolve({
    ...createUserDto,
    email: createUserDto.email?.toLowerCase(),
    username: createUserDto.username?.toLowerCase(),
  });

export const createUserValidator: Validator<CreateUserDto> = {
  schema,
  beforeValidate,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
