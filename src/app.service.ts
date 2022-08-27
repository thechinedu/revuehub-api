import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'success',
      data: {
        message: 'Welcome to the RevueHub API',
      },
    };
  }
}
