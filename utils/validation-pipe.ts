import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema, ValidationErrorItem } from 'joi';

export type Validator<T = any> = {
  schema: ObjectSchema<T>;
  beforeValidate?: (value: unknown) => unknown;
  afterValidate?: (value: unknown) => unknown;
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => any;
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private validator: Validator) {}

  async transform(value: unknown) {
    const { validator } = this;

    try {
      const transformedValue = validator?.beforeValidate(value) || value;
      await validator.schema.validateAsync(transformedValue, {
        abortEarly: false,
      });

      return transformedValue;
    } catch (error) {
      const validationErrorMessages = validator.serializeValidationMessages(
        error.details,
      );
      throw new BadRequestException(validationErrorMessages);
    }
  }
}
