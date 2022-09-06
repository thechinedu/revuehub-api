import { db } from '@/db';
import { Validator } from '@/utils';
import { HttpException, HttpStatus } from '@nestjs/common';
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

const beforeValidate = (userCredentialsDto: UserCredentialsDto) => ({
  ...userCredentialsDto,
  email: userCredentialsDto.email?.toLowerCase(),
});

const afterValidate = async (userCredentialsDto: UserCredentialsDto) => {
  try {
    const user = await db('users').where({ email: userCredentialsDto.email });

    if (!user) {
      throw new HttpException(
        {
          status: 'error',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return userCredentialsDto;
  } catch (err) {
    console.log(err); // TODO: set up error monitoring
    throw new HttpException(
      {
        status: 'error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
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
