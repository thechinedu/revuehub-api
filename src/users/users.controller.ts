import { ValidationPipe } from '@/utils';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user-dto';
import { createUserValidator } from './validators/create-user.validator';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  @Post()
  @UsePipes(new ValidationPipe(createUserValidator))
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log({ createUserDto });
    return 'user created';
  }
}
