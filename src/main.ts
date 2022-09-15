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
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT as string);
}
bootstrap();
