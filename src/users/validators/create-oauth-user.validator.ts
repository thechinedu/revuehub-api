import { memoryStore } from '@/db';
import { CreateUserFromOAuthDto } from '@/src/auth/dto/create-user-from-oauth-dto';
import { Validator } from '@/types';
import Joi, { ExternalValidationFunction, ValidationErrorItem } from 'joi';

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

export const schema: Joi.ObjectSchema<CreateUserFromOAuthDto> = object.keys({
  state: string.required().external(validateStateValue),
  code: string.required(),
});

// TODO: move validation messages into their own directory and reuse across application
const codeValidationMessages = {
  'string.empty': { code: 'Code cannot be empty' },
  'any.required': { code: 'Code must be provided' },
};

const stateValidationMessages = {
  'string.empty': { state: 'State cannot be empty' },
  'any.required': { state: 'State must be provided' },
};

export const createOAuthUserValidator: Validator<CreateUserFromOAuthDto> = {
  schema,
  // TODO: Make this a reusable utility
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => {
    const actions = {
      code: codeValidationMessages,
      state: stateValidationMessages,
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
