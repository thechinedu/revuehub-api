import { ValidationPipe } from '@/utils';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user-dto';
import { UserService } from './user.service';
import { createUserValidator } from './validators/create-user.validator';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe(createUserValidator))
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
