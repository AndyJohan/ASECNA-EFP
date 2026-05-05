import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'net';
import { AppModule } from './app.module';

const MAX_PORT_ATTEMPTS = 10;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const corsOrigin = configService.get<string>('app.corsOrigin') ?? '*';
  const preferredPort = configService.get<number>('app.port') ?? 3001;
  const port = await resolveAvailablePort(preferredPort);

  app.enableCors({
    origin: corsOrigin,
  });

  await app.listen(port);

  if (port !== preferredPort) {
    logger.warn(`Le port ${preferredPort} etait occupe. API demarree automatiquement sur ${port}.`);
  }

  logger.log(`API disponible sur http://localhost:${port}`);
}

async function resolveAvailablePort(startPort: number) {
  for (let offset = 0; offset < MAX_PORT_ATTEMPTS; offset += 1) {
    const candidatePort = startPort + offset;
    const available = await isPortAvailable(candidatePort);

    if (available) {
      return candidatePort;
    }
  }

  throw new Error(
    `Aucun port disponible entre ${startPort} et ${startPort + MAX_PORT_ATTEMPTS - 1}.`,
  );
}

function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

bootstrap();
