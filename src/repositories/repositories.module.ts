import { Module } from '@nestjs/common';

import { RepositoriesController } from './repositories.controller';

@Module({
  controllers: [RepositoriesController],
})
export class RepositoriesModule {}
