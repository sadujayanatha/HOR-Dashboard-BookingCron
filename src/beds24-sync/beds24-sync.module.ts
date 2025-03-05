import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from '../prisma/prisma.service';
import { Beds24SyncService } from './beds24-sync.service';
import { Beds24ApiService } from './beds24-api.service';
import { BookingsProcessor } from './bookings.processor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'bookings-sync',
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    PrismaService,
    Beds24SyncService,
    Beds24ApiService,
    BookingsProcessor,
  ],
  exports: [Beds24SyncService],
})
export class Beds24SyncModule {}
