import { ValidationPipe } from '@/utils';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { UserCredentialsDto } from './dto/user-credentials-dto';
import { loginValidator } from './validators/login.validator';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  @Post('/login')
  @UsePipes(new ValidationPipe(loginValidator))
  login(@Body() userCredentialsDto: UserCredentialsDto) {
    return 'hello login';
  }
}
