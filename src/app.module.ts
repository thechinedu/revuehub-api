import { AuthModule } from '@/src/auth/auth.module';
import { RepositoriesModule } from '@/src/repositories/repositories.module';
import { UsersModule } from '@/src/users/users.module';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [UsersModule, AuthModule, RepositoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
