import { AuthService } from '@/src/auth/auth.service';
import { CreateUserFromOAuthDto } from '@/src/auth/dto/create-user-from-oauth-dto';
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

import { CreateUserDto } from './dto/create-user-dto';
import { UserSerializer } from './user.serializer';
import { UserService } from './user.service';
import { createUserValidator } from './validators/create-user.validator';
import { createOAuthUserValidator } from './validators/create-oauth-user.validator';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

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

  @Post('/oauth/new')
  @UsePipes(new ValidationPipe(createOAuthUserValidator))
  @UseInterceptors(ClassSerializerInterceptor)
  async createUserFromOAuthInfo(
    @Body() createUserFromOAuthDto: CreateUserFromOAuthDto,
  ) {
    const oauthUserInfo = await this.authService.fetchOAuthUserInfo(
      createUserFromOAuthDto,
    );

    if (!oauthUserInfo) {
      throw new HttpException(
        {
          status: 'fail',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const { data: userInfo, token } = oauthUserInfo;
    const userEntity = await this.userService.findOrCreateUser(userInfo);
    const data = new UserSerializer(userEntity);

    return {
      status: 'success',
      data,
    };
  }
}
