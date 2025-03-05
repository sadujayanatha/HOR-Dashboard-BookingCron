import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 9900;
  await app.listen(port);

  logger.log(`Beds24 Sync Service is running on port ${port}`);
  logger.log(`Scheduled tasks initialized. Initial sync will run if needed.`);
}
bootstrap();
