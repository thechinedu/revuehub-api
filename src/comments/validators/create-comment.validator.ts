import { CommentLevel, CommentStatus, Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi, { CustomValidator } from 'joi';

import { CreateCommentDto } from '../dto/create-comment-dto';

const { number, object, string } = Joi.types();

const isSupportedValue: (values: string[]) => CustomValidator<string> =
  (supportedValues: string[]) => (value, helpers) => {
    if (!supportedValues.includes(value)) {
      return helpers.error('any.invalid');
    }

    return value;
  };

const validateCommentStatus = (): CustomValidator<string> =>
  isSupportedValue(Object.values(CommentStatus));

const validateCommentLevel = (): CustomValidator<string> =>
  isSupportedValue(Object.values(CommentLevel));

const schema: Joi.ObjectSchema<CreateCommentDto> = object.keys({
  user_id: number.required().greater(0),
  repository_blob_id: number.required().greater(0),
  parent_comment_id: number.optional().greater(0),
  content: string.required(),
  start_line: number.optional(),
  end_line: number.optional(),
  status: string.optional().custom(validateCommentStatus()),
  level: string.required().custom(validateCommentLevel()),
});

const messages = {
  user_id: generateValidationMessages({ field: 'user_id' }),
  repository_blob_id: generateValidationMessages({
    field: 'repository_blob_id',
  }),
  parent_comment_id: generateValidationMessages({ field: 'parent_comment_id' }),
  content: generateValidationMessages({ field: 'content', label: 'Content' }),
  start_line: generateValidationMessages({ field: 'start_line' }),
  end_line: generateValidationMessages({ field: 'end_line' }),
  status: generateValidationMessages({
    field: 'status',
    label: 'Status',
    overrides: {
      'any.invalid': {
        level: `Status is not valid. Status must be one of [${Object.values(
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
    },
  }),
};

export const createCommentValidator: Validator<CreateCommentDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
