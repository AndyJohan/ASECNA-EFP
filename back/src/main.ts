import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const corsOrigin = configService.get<string>('app.corsOrigin') ?? '*';
  const port = configService.get<number>('app.port') ?? 3001;

  app.enableCors({
    origin: corsOrigin,
  });

  await app.listen(port);
  logger.log(`API disponible sur http://localhost:${port}`);
}

bootstrap();
