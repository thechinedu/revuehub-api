import { AuthGuard } from '@/src/guards/auth';
import { ValidationPipe } from '@/src/pipes/validation';
import { RequestWithUserID } from '@/types';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
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

  @Post('/refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async refresh(
    @Req() req: RequestWithUserID,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.refresh(req.cookies.refreshToken, req.userID, res);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: RequestWithUserID) {
    return {
      status: 'success',
      data: {
        userID: req.userID,
      },
    };
  }
}
