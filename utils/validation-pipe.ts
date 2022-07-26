import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';

export type Validator<T = any> = {
  schema: ObjectSchema<T>;
  beforeValidate?: (value: unknown) => unknown;
  afterValidate?: (value: unknown) => unknown;
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private validator: Validator) {}

  async transform(value: unknown) {
    try {
      const transformedValue = this.validator?.beforeValidate(value) || value;
      await this.validator.schema.validateAsync(transformedValue);

      // transformedValue =
      //   this.validator?.afterValidate(transformedValue) || transformedValue;

      return transformedValue;
    } catch (error) {
      throw new BadRequestException(error.details);
    }
  }
}
