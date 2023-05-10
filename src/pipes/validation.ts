import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema, ValidationError, ValidationErrorItem } from 'joi';

export type Validator<T = any> = {
  schema: ObjectSchema<T>;
  beforeValidate?: (value: T) => Promise<T>;
  afterValidate?: (value: T) => Promise<T>;
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => any;
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly validator: Validator) {}

  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { validator } = this;

    try {
      if (!['body', 'query'].includes(metadata.type)) return value; // only run the validation pipe for request bodies and query paramaters

      const transformedValueBeforeValidation =
        (await validator?.beforeValidate?.(value)) || value;
      await validator.schema.validateAsync(transformedValueBeforeValidation, {
        abortEarly: false,
      });
      const transformedValue =
        (await validator?.afterValidate?.(transformedValueBeforeValidation)) ||
        transformedValueBeforeValidation;

      return transformedValue;
    } catch (error: unknown) {
      const validationErrorMessages = validator.serializeValidationMessages(
        (error as ValidationError).details,
      );

      throw new HttpException(
        { status: 'fail', ...validationErrorMessages },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
