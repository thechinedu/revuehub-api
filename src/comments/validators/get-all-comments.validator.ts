import { Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi from 'joi';

const { number, string } = Joi.types();

const schema = Joi.object({
  repository_id: number.required(),
  file_path: string.required(),
  view: string.required().custom((value, helpers) => {
    if (!['overview', 'code'].includes(value)) {
      return helpers.error('any.invalid');
    }

    return value;
  }),
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
  file_path: generateValidationMessages({
    field: 'file_path',
    overrides: {
      'any.required': {
        file_path:
          'No file_path provided. Pass in the file_path as a query parameter',
      },
    },
  }),
  view: generateValidationMessages({
    field: 'view',
    overrides: {
      'any.required': {
        view: 'No view provided. Pass in the view as a query parameter',
      },
      'any.invalid': {
        view: 'View must be either "overview" or "code"',
      },
    },
  }),
};

export const getAllCommentsValidator: Validator<{ repository_id: number }> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
