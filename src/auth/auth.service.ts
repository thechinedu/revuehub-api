import { AuthTokenType } from '@/types';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAuthTokenModel } from '../user-auth-tokens/user-auth-token.model';

import { UserModel } from '../users/user.model';
import { UserCredentialsDto } from './dto/user-credentials-dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userModel: UserModel,
    private userAuthTokenModel: UserAuthTokenModel,
  ) {}

  async loginUser(userCredentialsDto: UserCredentialsDto) {
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
    const { token: refreshToken } =
      await this.userAuthTokenModel.createAuthToken({
        userID: user.id,
        type: AuthTokenType.REFRESH_TOKEN,
      });

    return { accessToken, refreshToken };
  }
}
