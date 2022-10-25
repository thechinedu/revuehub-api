import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    try {
      const payload = this.jwtService.verify(req.cookies.accessToken);
      console.log({ payload });

      return true;
    } catch (err) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'You are not authorized to access this resource',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
