import { Validator } from '@/types';
import {
  dtoValidationErrorMessageSerializer,
  generateValidationMessages,
} from '@/utils';
import Joi from 'joi';

import { UpdateCommentDto } from '../dto/update-comment-dto';

const { object, string } = Joi.types();

const schema: Joi.ObjectSchema<UpdateCommentDto> = object.keys({
  content: string.required(),
});

const messages = {
  content: generateValidationMessages({ field: 'content', label: 'Content' }),
};

export const updateCommentValidator: Validator<UpdateCommentDto> = {
  schema,
  serializeValidationMessages: dtoValidationErrorMessageSerializer(messages),
};
