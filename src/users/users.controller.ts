import { ValidationPipe } from '@/utils';
import { Controller, Post, UsePipes } from '@nestjs/common';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  @Post()
  createUser() {
    return 'user created';
  }
}
