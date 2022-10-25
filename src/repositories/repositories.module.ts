import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { RepositoriesController } from './repositories.controller';
import { RepositoryModel } from './repository.model';
import { RepositoryService } from './repository.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_SECRET as string })],
  controllers: [RepositoriesController],
  providers: [RepositoryModel, RepositoryService],
})
export class RepositoriesModule {}
