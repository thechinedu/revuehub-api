import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const UnauthorizedException = new HttpException(
  {
    status: 'fail',
    message: 'You are not authorized to access this resource',
  },
  HttpStatus.UNAUTHORIZED,
);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userAuthTokenService: UserAuthTokenService,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const {
      cookies: { accessToken, refreshToken },
    } = req;

    if (req.path.endsWith('/auth/refresh')) {
      return this.validateRefreshToken(refreshToken);
    }

    return Promise.resolve(this.validateAccessToken(accessToken));
  }

  private validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      console.log({ payload });

      return true;
    } catch {
      throw UnauthorizedException;
    }
  }

  private async validateRefreshToken(token: string) {
    if (!token) throw UnauthorizedException;

    const refreshToken = await this.userAuthTokenService.findRefreshToken(
      token,
    );

    if (!refreshToken) throw UnauthorizedException;

    const {
      user_id: userID,
      is_valid: isValid,
      expires_at: expiresAt,
    } = refreshToken;

    if (!isValid || Date.now() > +expiresAt) throw UnauthorizedException;

    return true;
  }
}
