import { memoryStore } from '@/db';
import { CreateUserFromOAuthDto } from '@/src/auth/dto/create-user-from-oauth-dto';
import { Validator } from '@/types';
import { dtoValidationErrorMessageSerializer } from '@/utils';
import Joi, { ExternalValidationFunction } from 'joi';

const { object, string } = Joi.types();

const validateStateValue: ExternalValidationFunction = async (
  value: string,
) => {
  const memoryStoreClient = await memoryStore;
  const isStateValid = Boolean(await memoryStoreClient.exists(value));

  if (!isStateValid) {
    // TODO: Replace with custom error
    throw new Joi.ValidationError(
      'Invalid state',
      [{ message: `State is not valid`, path: [], type: '' }],
      () => null,
    );
  }

  return value;
};

const schema: Joi.ObjectSchema<CreateUserFromOAuthDto> = object.keys({
  state: string.required().external(validateStateValue),
  code: string.required(),
});

const codeValidationMessages = {
  'string.empty': { code: 'Code cannot be empty' },
  'any.required': { code: 'Code must be provided' },
};

const stateValidationMessages = {
  'string.empty': { state: 'State cannot be empty' },
  'any.required': { state: 'State must be provided' },
};

const messages = {
  code: codeValidationMessages,
  state: stateValidationMessages,
};

export const createOAuthUserValidator: Validator<CreateUserFromOAuthDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
