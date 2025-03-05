import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Beds24SyncService } from './beds24-sync/beds24-sync.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly beds24SyncService: Beds24SyncService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getStatus() {
    return {
      status: 'ok',
      service: 'beds24-sync-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('trigger-sync')
  async triggerSync(@Body() body: { forceInitial?: boolean }) {
    const { forceInitial } = body;

    if (forceInitial) {
      await this.beds24SyncService.scheduleInitialFullSync();
      return { message: 'Initial sync scheduled successfully' };
    } else {
      await this.beds24SyncService.syncRecentChanges();
      return { message: 'Incremental sync scheduled successfully' };
    }
  }
}
