import { Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi from 'joi';

const { number } = Joi.types();

const schema = Joi.object({
  repository_id: number.required(),
});

const messages = {
  repository_id: generateValidationMessages({
    field: 'repository_id',
    overrides: {
      'any.required': {
        repository_id:
          'No repository_id provided. Pass in the repository_id as a query parameter',
      },
    },
  }),
};

export const getAllCommentsValidator: Validator<{ repository_id: number }> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
