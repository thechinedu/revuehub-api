import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user-dto';
import { UserModel } from './user.model';

@Injectable()
export class UserService {
  constructor(private userModel: UserModel) {}

  createUser(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }
}
