import { isSupportedValue } from '@/src/comments/validators/create-comment.validator';
import { OAuthProviders, Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi, { CustomValidator } from 'joi';

import { CreateOAuthStateDto } from '../dto/create-oauth-state-dto';

const { object, string } = Joi.types();

const validateProviderValue = (): CustomValidator<string> =>
  isSupportedValue(Object.values(OAuthProviders));

const schema: Joi.ObjectSchema<CreateOAuthStateDto> = object.keys({
  provider: string.required().custom(validateProviderValue()),
});

const messages = {
  provider: generateValidationMessages({
    field: 'provider',
    label: 'Provider',
    overrides: {
      'any.invalid': {
        provider: `Provider is not valid. Provider must be one of [${Object.values(
          OAuthProviders,
        )}]`,
      },
    },
  }),
};

export const oauthStateValidator: Validator<CreateOAuthStateDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
