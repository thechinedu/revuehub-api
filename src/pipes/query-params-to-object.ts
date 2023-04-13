import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryParamsToObjectPipe implements PipeTransform {
  constructor(private readonly key: string) {}

  transform(value: unknown) {
    return {
      [this.key]: value,
    };
  }
}
