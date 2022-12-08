import { UserAuthTokenModule } from '@/src/user-auth-tokens/user-auth-token.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RepositoriesController } from './repositories.controller';
import { RepositoryModel } from './repository.model';
import { RepositoryBlobModel } from './repository-blob.model';
import { RepositoryContentModel } from './repository-content.model';
import { RepositoryService } from './repository.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.APP_SECRET as string }),
    UserAuthTokenModule,
  ],
  controllers: [RepositoriesController],
  providers: [
    RepositoryModel,
    RepositoryBlobModel,
    RepositoryContentModel,
    RepositoryService,
  ],
})
export class RepositoriesModule {}
