import { ValidationPipe } from '@/utils';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './Auth.service';
import { CreateOAuthStateDto } from './dto/create-oauth-state-dto';
import { UserCredentialsDto } from './dto/user-credentials-dto';
import { loginValidator } from './validators/login.validator';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe(loginValidator))
  async login(
    @Body() userCredentialsDto: UserCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.loginUser(
      userCredentialsDto,
    );

    // SameSite: https://web.dev/samesite-cookies-explained/
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60_000), // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 48 * 60 * 60_000), // 2 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
  }

  // TODO: Add validation for the request body
  @Post('/oauth/state')
  async createOauthState(@Body() createOAuthStateDto: CreateOAuthStateDto) {
    const state = await this.authService.createOAuthState(createOAuthStateDto);

    return {
      status: 'success',
      data: {
        state,
      },
    };
  }
}
