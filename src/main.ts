import path from 'path';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import hbs from 'handlebars';

import { ApiModule } from './api/api.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiModule,
    new FastifyAdapter({ logger: false }),
  );

  app.useStaticAssets({
    root: path.resolve(process.cwd(), 'public'),
  });

  app.setViewEngine({
    root: path.resolve(process.cwd(), 'views'),
    engine: {
      handlebars: hbs,
    },
  });

  app.setGlobalPrefix('/api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
