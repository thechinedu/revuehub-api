import { Exclude, Type } from 'class-transformer';

import { UserEntity } from './user.model';

export class UserSerializer {
  @Exclude()
  password_digest: string;

  constructor(userEntity: UserEntity) {
    Object.assign(this, userEntity);
  }
}
