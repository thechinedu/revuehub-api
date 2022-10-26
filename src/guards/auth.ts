import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import { RequestWithUserID } from '@/types';
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
      return this.validateRefreshToken(refreshToken, req);
    }

    return Promise.resolve(this.validateAccessToken(accessToken, req));
  }

  private validateAccessToken(token: string, req: RequestWithUserID) {
    try {
      const payload = this.jwtService.verify(token);

      req.userID = payload.id;

      return true;
    } catch {
      throw UnauthorizedException;
    }
  }

  private async validateRefreshToken(token: string, req: RequestWithUserID) {
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

    req.userID = userID;

    return true;
  }
}
