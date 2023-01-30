import { memoryStore } from '@/db';
import { CreateUserFromOAuthDto } from '@/src/auth/dto/create-user-from-oauth-dto';
import { Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi, { ExternalValidationFunction } from 'joi';

const { object, string } = Joi.types();

const validateStateValue: ExternalValidationFunction = async (
  value: string,
) => {
  const memoryStoreClient = await memoryStore;
  const isStateValid = Boolean(await memoryStoreClient.exists(value));

  if (!isStateValid) {
    throw new Joi.ValidationError(
      'Invalid state',
      [
        {
          message: '',
          path: [],
          type: 'any.invalid-state',
          context: {
            key: 'state',
          },
        },
      ],
      () => null,
    );
  }

  return value;
};

const schema: Joi.ObjectSchema<CreateUserFromOAuthDto> = object.keys({
  state: string.required().external(validateStateValue),
  code: string.required(),
});

const messages = {
  code: generateValidationMessages({ field: 'code', label: 'Code' }),
  state: generateValidationMessages({
    field: 'state',
    label: 'State',
    overrides: {
      'any.invalid-state': {
        state: 'State is not valid',
      },
    },
  }),
};

export const createOAuthUserValidator: Validator<CreateUserFromOAuthDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
