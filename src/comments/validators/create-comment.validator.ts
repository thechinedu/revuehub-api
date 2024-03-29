import { CommentLevel, CommentStatus, Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi, { CustomValidator } from 'joi';

import { CreateCommentDto } from '../dto/create-comment-dto';

const { any, number, object, string } = Joi.types();

export const isSupportedValue: (values: string[]) => CustomValidator<string> =
  (supportedValues: string[]) => (value, helpers) => {
    if (!supportedValues.includes(value)) {
      return helpers.error('any.invalid');
    }

    if (value === CommentLevel.LINE) {
      const {
        state: { ancestors },
      } = helpers;
      const {
        start_line: startLine,
        end_line: endLine,
        insertion_pos: insertionPos,
      } = ancestors?.[0];

      if ([startLine, endLine, insertionPos].includes(undefined)) {
        return helpers.error('any.missing-lines');
      }

      if (endLine < startLine) return helpers.error('any.invalid-lines');
    }

    return value;
  };

const validateLevel: CustomValidator<string> = (value, helpers) => {
  const {
    state: { ancestors },
  } = helpers;
  const { level, snippet, file_path } = ancestors?.[0];

  if (level === CommentLevel.LINE && (!snippet || !file_path)) {
    return helpers.error('any.invalid-line-comment');
  }

  if (level === CommentLevel.FILE && !file_path) {
    return helpers.error('any.invalid-file-comment');
  }

  return value;
};

const validateContent: CustomValidator<string> = (value, helpers) => {
  const {
    state: { ancestors },
  } = helpers;
  const { level } = ancestors?.[0];

  if (typeof value !== 'string') {
    return helpers.error('string.base');
  }

  if (level !== CommentLevel.PROJECT && value.trim().length === 0) {
    return helpers.error('any.required');
  }

  return value;
};

const schema: Joi.ObjectSchema<CreateCommentDto> = object.keys({
  snippet: string.optional(),
  file_path: string.optional(),
  repository_id: number.required().positive().integer(),
  review_summary_id: number.optional().positive().integer(),
  parent_comment_id: number.optional().positive().integer(),
  content: any.required().custom(validateContent),
  status: string
    .optional()
    .custom(isSupportedValue(Object.values(CommentStatus))),
  level: string
    .required()
    .custom(isSupportedValue(Object.values(CommentLevel)))
    .custom(validateLevel),
  start_line: number.optional().greater(0),
  end_line: number.optional().greater(0),
  insertion_pos: number.optional(),
});

const messages = {
  snippet: generateValidationMessages({
    field: 'snippet',
  }),
  file_path: generateValidationMessages({
    field: 'file_path',
  }),
  repository_id: generateValidationMessages({
    field: 'repository_id',
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
      'any.missing-lines': {
        level:
          "start_line, end_line and insertion_pos must be provided when the comment level is set to 'LINE'",
      },
      'any.invalid-lines': {
        level: 'start_line must be less than or equal to end_line',
      },
      'any.invalid-line-comment': {
        level:
          "snippet and file_path must be specified when the comment level is 'LINE'",
      },
      'any.invalid-file-comment': {
        level: "file_path must be specified when the comment level is 'FILE'",
      },
    },
  }),
};

export const createCommentValidator: Validator<CreateCommentDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
