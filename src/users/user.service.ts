import { Injectable } from '@nestjs/common';
import { CreateOauthStateDto } from './dto/create-oauth-state-dto';

import { CreateUserDto } from './dto/create-user-dto';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
  constructor(private userModel: UserModel) {}

  createUser(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  createOauthState(createOauthStateDto: CreateOauthStateDto) {
    return this.userModel.createOauthState(createOauthStateDto);
  }
}
