import { OAuthProviders, Validator } from '@/types';
import { dtoValidationErrorMessageSerializer } from '@/utils';
import Joi, { CustomValidator } from 'joi';

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
  'string.empty': { password: 'Provider cannot be empty' },
  'any.required': { provider: 'No provider provided' },
  'string.base': { provider: 'Provider must be a string' },
  'any.invalid': {
    provider: 'Provider is not supported',
  },
};

const messages = {
  provider: providerValidationMessages,
};

export const oauthStateValidator: Validator<CreateOAuthStateDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
