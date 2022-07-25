import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';

export type Validator<T = any> = {
  schema: ObjectSchema<T>;
  beforeValidate: (value: unknown) => void;
  afterValidate: (value: unknown) => void;
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private validator: Validator) {}

  transform(value: unknown) {
    const { error } = this.validator.schema.validate(value);
    if (error) {
      throw new BadRequestException(error.details);
    }
    return value;
  }
}
