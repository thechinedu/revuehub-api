import { db } from '@/db';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
  verifyPassword,
} from '@/utils';
import { Validator } from '@/types';
import Joi from 'joi';

import { UserCredentialsDto } from '../dto/user-credentials-dto';

const { object, string } = Joi.types();

const schema: Joi.ObjectSchema<UserCredentialsDto> = object.keys({
  email: string.email().required(),
  password: string.required(),
});

const messages = {
  email: generateValidationMessages({ field: 'email', label: 'Email address' }),
  password: generateValidationMessages({
    field: 'password',
    label: 'Password',
  }),
  message: generateValidationMessages({
    field: 'message',
    overrides: {
      'any.custom-error': {
        message: 'Email or password is invalid',
      },
    },
  }),
};

const beforeValidate = (userCredentialsDto: UserCredentialsDto) =>
  Promise.resolve({
    ...userCredentialsDto,
    email: userCredentialsDto.email?.toLowerCase(),
  });

const afterValidate = async (userCredentialsDto: UserCredentialsDto) => {
  const user = (
    await db('users')
      .select('id', 'password_digest')
      .where({ email: userCredentialsDto.email })
  )[0];

  if (
    !user ||
    !(await verifyPassword(user.password_digest, userCredentialsDto.password))
  ) {
    throw new Joi.ValidationError(
      'Invalid credentials',
      [
        {
          message: '',
          path: [],
          type: 'any.custom-error',
          context: {
            key: 'message',
          },
        },
      ],
      () => null,
    );
  }

  // TODO: decorate dto with user id to help ensure authService
  // doesn't query the db again for the user.
  // Update dto type and add relevant user entity fields as optional
  return { ...userCredentialsDto, id: user.id };
};

export const loginValidator: Validator<UserCredentialsDto> = {
  schema,
  beforeValidate,
  afterValidate,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
