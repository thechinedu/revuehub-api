import { db } from '@/db';
import { Validator, verifyPassword } from '@/utils';
import Joi, { ValidationErrorItem } from 'joi';

import { UserCredentialsDto } from '../dto/user-credentials-dto';

const { object, string } = Joi.types();

export const schema: Joi.ObjectSchema<UserCredentialsDto> = object.keys({
  email: string.email().required(),
  password: string.min(8).required(),
});

// TODO: move validation messages into their own directory and reuse across application

const emailValidationMessages = {
  'string.email': { email: 'The provided email address is not valid' },
  'string.empty': { email: 'Email address cannot be empty' },
  'any.required': { email: 'No email address provided' },
};

const passwordValidationMessages = {
  'string.min': { password: 'Password should be a minimum of 8 characters' },
  'string.empty': { password: 'Password cannot be empty' },
  'any.required': { password: 'No password provided' },
  'string.base': { password: 'Password must be a string' },
};

const beforeValidate = (userCredentialsDto: UserCredentialsDto) =>
  Promise.resolve({
    ...userCredentialsDto,
    email: userCredentialsDto.email?.toLowerCase(),
  });

const afterValidate = async (userCredentialsDto: UserCredentialsDto) => {
  const user = (
    await db('users')
      .select('email', 'password_digest')
      .where({ email: userCredentialsDto.email })
  )[0];

  if (
    !user ||
    !(await verifyPassword(user.password_digest, userCredentialsDto.password))
  ) {
    // TODO: Replace with custom error
    throw new Joi.ValidationError(
      'Invalid credentials',
      [{ message: `Email or Password is invalid`, path: [], type: '' }],
      () => null,
    );
  }

  // TODO: decorate dto with user id to help ensure authService
  // doesn't query the db again for the user.
  // Update dto type and add relevant user entity fields as optional
  return userCredentialsDto;
};

export const loginValidator: Validator<UserCredentialsDto> = {
  schema,
  beforeValidate,
  afterValidate,
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => {
    const actions = {
      email: emailValidationMessages,
      password: passwordValidationMessages,
    };
    const acc = {};

    errorDetails.forEach((details) => {
      const { context, type } = details;
      let messageRecord: Record<string, string> | ValidationErrorItem;

      if (context?.key) {
        const key = actions[context.key as keyof typeof actions];
        messageRecord = key?.[type as keyof typeof key];
      } else {
        messageRecord = details;
      }

      Object.assign(acc, messageRecord);
    });

    return { data: acc };
  },
};
