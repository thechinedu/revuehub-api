import { Module } from '@nestjs/common';

import { RepositoriesController } from './repositories.controller';
import { RepositoryModel } from './repository.model';
import { RepositoryService } from './repository.service';

@Module({
  controllers: [RepositoriesController],
  providers: [RepositoryModel, RepositoryService],
})
export class RepositoriesModule {}
