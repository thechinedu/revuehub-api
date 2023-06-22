import { db } from '@/db';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  });

  app.use(cookieParser());

  console.log('Running migrations...');

  await db.migrate.latest();

  console.log('Migrations complete');

  await app.listen(process.env.PORT as string);
}
bootstrap();
