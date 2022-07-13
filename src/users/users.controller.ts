import { Controller, Post } from '@nestjs/common';

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
