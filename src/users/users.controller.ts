import { ValidationPipe } from '@/utils';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';

import { CreateOauthStateDto } from './dto/create-oauth-state-dto';
import { CreateOauthUserDto } from './dto/create-oauth-user-dto';
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

  // TODO: Add validation for the request body
  @Post('/oauth/state')
  async createOauthState(@Body() createOauthStateDto: CreateOauthStateDto) {
    const state = await this.userService.createOauthState(createOauthStateDto);

    return {
      status: 'success',
      data: {
        state,
      },
    };
  }

  // TODO: Add validation for the request body
  @Post('/oauth/new')
  @UseInterceptors(ClassSerializerInterceptor)
  async createOauthUser(@Body() createOauthUserDto: CreateOauthUserDto) {
    const userEntity = await this.userService.createOauthUser(
      createOauthUserDto,
    );

    if (!userEntity)
      throw new HttpException(
        {
          status: 'fail',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const data = new UserSerializer(userEntity);

    return {
      status: 'success',
      data,
    };
  }
}
