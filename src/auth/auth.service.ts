import { Injectable } from '@nestjs/common';
import { UserCredentialsDto } from './dto/user-credentials-dto';

@Injectable()
export class AuthService {
  loginUser(userCredentialsDto: UserCredentialsDto) {}
}
