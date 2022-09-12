import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { UserCredentialsDto } from './dto/user-credentials-dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  loginUser(userCredentialsDto: UserCredentialsDto) {
    // const accessToken = this.jwtService.sign({
    //   email: userCredentialsDto.email,
    // });
    // const refreshToken = randomBytes(32).toString('base64');
    //
    // Get user via email address
    // Generate accessToken using jwt service (expires in 15 minutes)
    // Generate unique refresh token (check db for existence of generated token and regenerate if it exists)
    //    expires in 48 hours
    // Insert refresh token into user_auth_tokens table
    // Send 204 response to client
    // Store accessToken and refreshToken pair as secure httpOnly cookies
    //
  }
}
