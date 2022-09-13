import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

import { UserModel } from '../users/user.model';
import { UserCredentialsDto } from './dto/user-credentials-dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private userModel: UserModel) {}

  async loginUser(userCredentialsDto: UserCredentialsDto) {
    // const refreshToken = randomBytes(32).toString('base64');
    //
    const user = await this.userModel.find({
      where: {
        email: userCredentialsDto.email,
      },
      select: ['id'],
    });
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '15m',
      },
    );
    // Generate unique refresh token (check db for existence of generated token and regenerate if it exists)
    //    expires in 48 hours
    // this.userAuthTokens.createAuthToken

    // Insert refresh token into user_auth_tokens table
    // Send 204 response to client
    // Store accessToken and refreshToken pair as secure httpOnly cookies
    //
  }
}
