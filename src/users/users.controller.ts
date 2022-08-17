import { ValidationPipe } from '@/utils';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user-dto';
import { UserSerializer } from './user.serializer';
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
  @UseInterceptors(ClassSerializerInterceptor)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userEntity = await this.userService.createUser(createUserDto);
    const data = new UserSerializer(userEntity);

    return {
      status: 'success',
      data,
    };
  }
}
