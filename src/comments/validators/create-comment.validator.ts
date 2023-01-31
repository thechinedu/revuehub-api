import { CommentLevel, CommentStatus, Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi, { CustomValidator } from 'joi';

import { CreateCommentDto } from '../dto/create-comment-dto';

const { number, object, string } = Joi.types();

export const isSupportedValue: (values: string[]) => CustomValidator<string> =
  (supportedValues: string[]) => (value, helpers) => {
    if (!supportedValues.includes(value)) {
      return helpers.error('any.invalid');
    }

    if (value === CommentLevel.LINE) {
      const {
        state: { ancestors },
      } = helpers;
      const { start_line: startLine, end_line: endLine } = ancestors?.[0];

      if (startLine == null || endLine == null)
        return helpers.error('any.missing-line');

      if (endLine < startLine) return helpers.error('any.invalid-lines');
    }

    return value;
  };

const validateCommentStatus = (): CustomValidator<string> =>
  isSupportedValue(Object.values(CommentStatus));

const validateCommentLevel = (): CustomValidator<string> =>
  isSupportedValue(Object.values(CommentLevel));

const schema: Joi.ObjectSchema<CreateCommentDto> = object.keys({
  repository_blob_id: number.required().greater(0),
  parent_comment_id: number.optional().greater(0),
  content: string.required(),
  status: string.optional().custom(validateCommentStatus()),
  level: string.required().custom(validateCommentLevel()),
  start_line: number.optional().greater(0),
  end_line: number.optional().greater(0),
});

const messages = {
  repository_blob_id: generateValidationMessages({
    field: 'repository_blob_id',
  }),
  parent_comment_id: generateValidationMessages({ field: 'parent_comment_id' }),
  content: generateValidationMessages({ field: 'content', label: 'Content' }),
  start_line: generateValidationMessages({
    field: 'start_line',
    overrides: {
      'number.greater': {
        start_line: 'start_line must be a value greater than 0',
      },
    },
  }),
  end_line: generateValidationMessages({
    field: 'end_line',
    overrides: {
      'number.greater': {
        end_line: 'end_line must be a value greater than 0',
      },
    },
  }),
  status: generateValidationMessages({
    field: 'status',
    label: 'Status',
    overrides: {
      'any.invalid': {
        status: `Status is not valid. Status must be one of [${Object.values(
          CommentStatus,
        )}]`,
      },
    },
  }),
  level: generateValidationMessages({
    field: 'level',
    label: 'Level',
    overrides: {
      'any.invalid': {
        level: `Level is not valid. Level must be one of [${Object.values(
          CommentLevel,
        )}]`,
      },
      'any.missing-line': {
        level:
          "start_line and end_line must be provided when the comment level is set to 'LINE'",
      },
      'any.invalid-lines': {
        level: 'start_line must be less than end_line',
      },
    },
  }),
};

export const createCommentValidator: Validator<CreateCommentDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
