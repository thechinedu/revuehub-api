import { db } from '@/db';
import { Validator } from '@/src/pipes/validation';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi, { CustomValidator, ExternalValidationFunction } from 'joi';
import zxcvbn from 'zxcvbn';

import { CreateUserDto } from '../dto/create-user-dto';

const { object, string } = Joi.types();

const validateUniqueness: (
  field: 'email' | 'username',
) => ExternalValidationFunction = (field) => async (value: string) => {
  const res = await db('users').where(field, value);

  if (res.length) {
    throw new Joi.ValidationError(
      'Not unique',
      [
        {
          message: '',
          path: [],
          type: 'any.not-unique',
          context: {
            key: field,
          },
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

const schema: Joi.ObjectSchema<CreateUserDto> = object.keys({
  email: string.email().required().external(validateUniqueness('email')),
  username: string
    .pattern(/^[a-z0-9](\-?[a-z0-9])*$/)
    .required()
    .external(validateUniqueness('username')),
  password: string.min(8).required().custom(validatePasswordStrength),
});

const messages = {
  email: generateValidationMessages({
    field: 'email',
    label: 'Email address',
    overrides: {
      'any.not-unique': {
        email: 'The provided email address is not available',
      },
    },
  }),
  username: generateValidationMessages({
    field: 'username',
    label: 'Username',
    overrides: {
      'string.pattern.base': {
        username:
          'Username can only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen',
      },
      'any.not-unique': {
        username: 'The provided username is not available',
      },
    },
  }),
  password: generateValidationMessages({
    field: 'password',
    label: 'Password',
    overrides: {
      'any.invalid': {
        password:
          'Password is not secure enough. Password should be a minimum of 8 characters including uppercase and lowercase letters, numbers and symbols',
      },
    },
  }),
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
