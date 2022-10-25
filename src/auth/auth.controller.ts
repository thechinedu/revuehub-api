import { ValidationPipe } from '@/src/pipes/validation';
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

import { AuthService } from './auth.service';
import { CreateOAuthStateDto } from './dto/create-oauth-state-dto';
import { UserCredentialsAfterValidation } from './dto/user-credentials-dto';
import { loginValidator } from './validators/login.validator';
import { oauthStateValidator } from './validators/oauth-state.validator';

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
    @Body() userCredentialsAfterValidation: UserCredentialsAfterValidation,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.loginUser(userCredentialsAfterValidation.id, res);
  }

  @Post('/oauth/state')
  @UsePipes(new ValidationPipe(oauthStateValidator))
  async createOAuthState(@Body() createOAuthStateDto: CreateOAuthStateDto) {
    const state = await this.authService.createOAuthState(createOAuthStateDto);

    return {
      status: 'success',
      data: {
        state,
      },
    };
  }
}
