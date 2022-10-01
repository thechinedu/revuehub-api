import { OAuthProviders } from '@/types';
import { Validator } from '@/utils';
import Joi, { CustomValidator, ValidationErrorItem } from 'joi';

import { CreateOAuthStateDto } from '../dto/create-oauth-state-dto';

const { object, string } = Joi.types();

const validateProviderValue: CustomValidator<string> = (value, helpers) => {
  const supportedProviders = Object.values(OAuthProviders) as string[];

  if (!supportedProviders.includes(value)) {
    return helpers.error('any.invalid');
  }

  return value;
};

export const schema: Joi.ObjectSchema<CreateOAuthStateDto> = object.keys({
  provider: string.required().custom(validateProviderValue),
});

const providerValidationMessages = {
  'string.empty': { password: 'Provier cannot be empty' },
  'any.required': { provider: 'No provider provided' },
  'string.base': { provider: 'Provider must be a string' },
  'any.invalid': {
    provider: 'Provider is not supported',
  },
};

export const oauthStateValidator: Validator<CreateOAuthStateDto> = {
  schema,
  // TODO: Make this a reusable utility
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => {
    const actions = {
      provider: providerValidationMessages,
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
