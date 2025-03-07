import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Beds24ApiService } from './beds24-api.service';
import { format, subDays, addDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { Beds24Property, Beds24Room } from './interfaces/beds24-api.interface';
import { PropertyModel, RoomModel } from './interfaces/db.interface';
import {
  FullSyncJobData,
  IncrementalSyncJobData,
  SyncOperationType,
  SyncStatus,
} from './interfaces/sync.interface';

@Injectable()
export class Beds24SyncService implements OnModuleInit {
  private readonly logger = new Logger(Beds24SyncService.name);
  private readonly pageSize = 500;
  private isInitialSyncComplete = false;
  private lastSyncTimestamp: Date | null = null;

  constructor(
    private beds24ApiService: Beds24ApiService,
    @InjectQueue('bookings-sync') private bookingsQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    // Check if we need to perform initial sync by looking for properties and bookings
    const propertiesCount = await this.prismaService.properties.count();
    const bookingCount = await this.prismaService.bookings.count();

    const needsInitialSync = propertiesCount === 0 || bookingCount === 0;

    if (needsInitialSync) {
      this.logger.log(
        'Database needs initial population. Scheduling initial full sync.',
      );
      await this.scheduleInitialFullSync();
    } else {
      this.isInitialSyncComplete = true;
      this.logger.log(
        'Database already contains properties and bookings. Initial sync will be skipped.',
      );

      // Get the most recent sync timestamp from the sync log
      const lastSuccessfulSync = await this.prismaService.syncLog.findFirst({
        where: {
          status: SyncStatus.SUCCESS,
        },
        orderBy: {
          endTimestamp: 'desc',
        },
      });

      if (lastSuccessfulSync?.endTimestamp) {
        this.lastSyncTimestamp = lastSuccessfulSync.endTimestamp;
        this.logger.log(
          `Last successful sync was at ${this.lastSyncTimestamp.toISOString()}`,
        );
      } else {
        // Fallback to recent date
        this.lastSyncTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        this.logger.log(
          `No previous sync found. Using fallback timestamp: ${this.lastSyncTimestamp.toISOString()}`,
        );
      }
    }
  }

  // Schedule the initial full sync
  async scheduleInitialFullSync() {
    try {
      this.logger.log('Starting initial full sync of all properties');

      // Create a sync log entry
      const syncLog = await this.prismaService.syncLog.create({
        data: {
          operationType: SyncOperationType.INITIAL,
          status: SyncStatus.IN_PROGRESS,
          recordsProcessed: 0,
        },
      });

      // First, get all properties from Beds24
      const properties = await this.beds24ApiService.getProperties();
      this.logger.debug(
        `Found ${properties.length} properties for initial sync`,
      );

      // Upsert properties in our database
      for (const propertyData of properties) {
        await this.upsertProperty(propertyData);
      }

      this.logger.log(`Synced ${properties.length} properties to database`);

      // Set date range for historical data
      const fromDate = format(subDays(new Date(), 730), 'yyyy-MM-dd'); // 2 years in the past
      const toDate = format(addDays(new Date(), 730), 'yyyy-MM-dd'); // 2 years in the future

      // Queue full sync jobs for each property
      for (const property of properties) {
        await this.scheduleFullPropertySync(
          property.beds24_id ?? '',
          fromDate,
          toDate,
          syncLog.id,
        );
      }

      this.isInitialSyncComplete = true;
      this.lastSyncTimestamp = new Date();

      // Update the sync log as completed
      await this.prismaService.syncLog.update({
        where: { id: syncLog.id },
        data: {
          endTimestamp: this.lastSyncTimestamp,
          status: SyncStatus.SUCCESS,
        },
      });

      this.logger.log(
        'Completed scheduling initial full sync for all properties',
      );
    } catch (error) {
      this.logger.error(`Error in initial full sync: ${error.message}`);

      // Create or update sync log
      await this.prismaService.syncLog.create({
        data: {
          operationType: SyncOperationType.INITIAL,
          status: SyncStatus.ERROR,
          errorMessage: error.message,
          endTimestamp: new Date(),
        },
      });

      // Schedule a retry after some delay
      setTimeout(() => this.scheduleInitialFullSync(), 60000);
    }
  }

  // Schedule a full sync for a single property with pagination
  async scheduleFullPropertySync(
    propertyId: string,
    fromDate: string,
    toDate: string,
    syncLogId: number,
  ) {
    this.logger.debug(`Scheduling full sync for property ${propertyId}`);

    try {
      // Create the job data with proper types
      const jobData: FullSyncJobData = {
        propertyId,
        fromDate,
        toDate,
        page: 1,
        pageSize: this.pageSize,
        syncLogId,
      };

      // Queue the first page job. The processor will handle pagination
      await this.bookingsQueue.add('full-sync-property-page', jobData, {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: true,
      });

      this.logger.debug(
        `Scheduled initial page for full sync of property ${propertyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule full sync for property ${propertyId}: ${error.message}`,
      );
      throw error;
    }
  }

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncRecentChanges() {
    // Skip if initial sync hasn't completed
    if (!this.isInitialSyncComplete) {
      this.logger.log(
        'Skipping incremental sync as initial sync is not complete',
      );
      return;
    }

    this.logger.log('Starting hourly incremental sync');
    try {
      // Create a sync log entry
      const syncLog = await this.prismaService.syncLog.create({
        data: {
          operationType: SyncOperationType.INCREMENTAL,
          status: SyncStatus.IN_PROGRESS,
          recordsProcessed: 0,
        },
      });

      // Get all properties
      const properties = await this.beds24ApiService.getProperties();
      this.logger.debug(
        `Found ${properties.length} properties to sync incrementally`,
      );

      // Update our property data
      for (const propertyData of properties) {
        await this.upsertProperty(propertyData);
      }

      // We'll sync data modified since the last sync time
      const modifiedFrom = this.lastSyncTimestamp
        ? format(this.lastSyncTimestamp, "yyyy-MM-dd'T'HH:mm:ss")
        : format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"); // 1 day as fallback

      // Update the last sync timestamp
      this.lastSyncTimestamp = new Date();

      // Queue a job for each property
      for (const property of properties) {
        await this.syncRecentPropertyChanges(
          property.beds24_id ?? '',
          modifiedFrom,
          syncLog.id,
        );
      }

      // Update the sync log as completed
      await this.prismaService.syncLog.update({
        where: { id: syncLog.id },
        data: {
          endTimestamp: new Date(),
          status: SyncStatus.SUCCESS,
        },
      });

      this.logger.log('Completed incremental sync for all properties');
    } catch (error) {
      this.logger.error(`Error in incremental sync: ${error.message}`);

      // Update sync log with error
      await this.prismaService.syncLog.update({
        where: {
          id:
            (
              await this.prismaService.syncLog.findFirst({
                where: {
                  operationType: SyncOperationType.INCREMENTAL,
                  status: SyncStatus.IN_PROGRESS,
                },
                orderBy: { startTimestamp: 'desc' },
              })
            )?.id || 0,
        },
        data: {
          endTimestamp: new Date(),
          status: SyncStatus.ERROR,
          errorMessage: error.message,
        },
      });
    }
  }

  async syncRecentPropertyChanges(
    propertyId: string,
    modifiedFrom: string,
    syncLogId: number,
  ) {
    this.logger.debug(
      `Adding incremental sync job for property ${propertyId} since ${modifiedFrom}`,
    );

    try {
      // Create the job data with proper types
      const jobData: IncrementalSyncJobData = {
        propertyId,
        modifiedFrom,
        syncLogId,
      };

      // Add to processing queue
      await this.bookingsQueue.add('incremental-sync-property', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      });

      this.logger.debug(
        `Queued incremental sync job for property ${propertyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue sync job for property ${propertyId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async upsertProperty(propertyData: Beds24Property): Promise<void> {
    try {
      const propertyId = propertyData.beds24_id;
      if (!propertyId) {
        this.logger.warn('Skipping property without ID');
        return;
      }

      // Create property model
      const propertyModel: PropertyModel = {
        beds24_id: propertyId,
        name: propertyData.name || 'Unnamed Property',
        address: propertyData.address,
        city: propertyData.city,
        country: propertyData.country,
        checkinStart: propertyData.checkinTimeFrom,
        checkinEnd: propertyData.checkinTimeTo,
        checkoutStart: propertyData.checkoutTime,
        specialNote: propertyData.specialInstructions,
        published: true,
      };

      // Upsert property
      await this.prismaService.properties.upsert({
        where: { beds24_id: propertyId },
        update: propertyModel,
        create: propertyModel,
      });

      // If property has rooms, sync them too
      if (propertyData.rooms && Array.isArray(propertyData.rooms)) {
        for (const roomData of propertyData.rooms) {
          await this.upsertRoom(propertyId, roomData);
        }
      }
    } catch (error) {
      this.logger.error(`Error upserting property: ${error.message}`);
      throw error;
    }
  }

  private async upsertRoom(
    propertyId: string,
    roomData: Beds24Room,
  ): Promise<void> {
    try {
      const roomId = roomData.id?.toString();
      if (!roomId) {
        this.logger.warn(`Skipping room without ID for property ${propertyId}`);
        return;
      }

      // Create room model
      const roomModel: RoomModel = {
        room_id: roomId,
        room_name: roomData.name || 'Unnamed Room',
        qty: roomData.quantity || roomData.roomQty || 1,
        type: roomData.type || 1,
        rates: roomData.rates || 1,
        num_guests: roomData.maxGuests || roomData.maxPeople || 2,
        num_beds: roomData.beds || 1,
        num_bedrooms: roomData.bedrooms || 1,
        num_baths: roomData.bathrooms || 1,
        featured: roomData.featured || false,
        status: roomData.status !== false,
        propertyId,
      };

      // Upsert room
      await this.prismaService.rooms.upsert({
        where: { room_id: roomId },
        update: roomModel,
        create: { ...roomModel, createdAt: new Date(), updatedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(
        `Error upserting room for property ${propertyId}: ${error.message}`,
      );
      throw error;
    }
  }
}
