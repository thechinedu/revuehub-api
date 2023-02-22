import { AuthService } from '@/src/auth/auth.service';
import { CreateUserFromOAuthDto } from '@/src/auth/dto/create-user-from-oauth-dto';
import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import { ValidationPipe } from '@/src/pipes/validation';
import { AuthTokenType } from '@/types';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';

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
    private userAuthTokenService: UserAuthTokenService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe(createUserValidator))
  @UseInterceptors(ClassSerializerInterceptor)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userEntity = await this.userService.createUser(createUserDto);
    const data = new UserSerializer(userEntity);

    await this.authService.loginUser(userEntity.id, res);

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
    @Res({ passthrough: true }) res: Response,
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
    await this.userAuthTokenService.removeAll({
      where: { type: AuthTokenType.OAUTH_TOKEN },
    });
    await this.userAuthTokenService.createAuthToken({
      userID: userEntity.id,
      type: AuthTokenType.OAUTH_TOKEN,
      token,
    });
    const data = new UserSerializer(userEntity);

    await this.authService.loginUser(userEntity.id, res);

    return {
      status: 'success',
      data,
    };
  }
}
