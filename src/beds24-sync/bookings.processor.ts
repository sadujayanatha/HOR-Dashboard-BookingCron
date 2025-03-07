import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Beds24ApiService } from './beds24-api.service';
import { Beds24Booking } from './interfaces/beds24-api.interface';
import { BookingDayModel, BookingModel } from './interfaces/db.interface';
import {
  FullSyncJobData,
  IncrementalSyncJobData,
  SyncStatus,
} from './interfaces/sync.interface';

@Processor('bookings-sync')
export class BookingsProcessor {
  private readonly logger = new Logger(BookingsProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private beds24ApiService: Beds24ApiService,
  ) {}

  @Process('full-sync-property-page')
  async processFullSyncPage(job: Job<FullSyncJobData>) {
    const { propertyId, fromDate, toDate, page, pageSize, syncLogId } =
      job.data;
    this.logger.debug(
      `Processing full sync page ${page} for property ${propertyId}`,
    );

    try {
      // Fetch the bookings for this page
      const { bookings, hasNextPage } =
        await this.beds24ApiService.getBookingsForProperty(propertyId, {
          fromDate,
          toDate,
          page,
          pageSize,
        });

      if (bookings.length === 0) {
        this.logger.debug(
          `No bookings found on page ${page} for property ${propertyId}`,
        );
        return;
      }

      // Process each booking
      for (const bookingData of bookings) {
        await this.upsertBooking(propertyId, bookingData);
      }

      // Update the sync log with the number of processed records
      await this.prismaService.syncLog.update({
        where: { id: syncLogId },
        data: {
          recordsProcessed: {
            increment: bookings.length,
          },
        },
      });

      // If there are more pages, queue the next page
      if (hasNextPage && page < 100) {
        // Limit to prevent infinite loops
        await job.queue.add(
          'full-sync-property-page',
          {
            ...job.data,
            page: page + 1,
          },
          {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 10000,
            },
            removeOnComplete: true,
          },
        );
      }

      this.logger.debug(
        `Successfully processed ${bookings.length} bookings for property ${propertyId} on page ${page}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process page ${page} for property ${propertyId}: ${error.message}`,
      );

      // Update the sync log with the error
      await this.prismaService.syncLog.update({
        where: { id: syncLogId },
        data: {
          status: SyncStatus.ERROR,
          errorMessage: `Error on page ${page}: ${error.message}`,
        },
      });

      throw error;
    }
  }

  @Process('incremental-sync-property')
  async processIncrementalSync(job: Job<IncrementalSyncJobData>) {
    const { propertyId, modifiedFrom, syncLogId } = job.data;
    this.logger.debug(
      `Processing incremental sync for property ${propertyId} since ${modifiedFrom}`,
    );

    try {
      // Fetch recently modified bookings
      const bookings = await this.beds24ApiService.getRecentBookings(
        propertyId,
        modifiedFrom,
      );

      this.logger.debug(
        `Retrieved ${bookings.length} recently modified bookings for property ${propertyId}`,
      );

      if (bookings.length === 0) {
        return;
      }

      // Process each booking
      for (const bookingData of bookings) {
        await this.upsertBooking(propertyId, bookingData);
      }

      // Update the sync log
      await this.prismaService.syncLog.update({
        where: { id: syncLogId },
        data: {
          recordsProcessed: {
            increment: bookings.length,
          },
        },
      });

      this.logger.debug(
        `Successfully processed ${bookings.length} recent bookings for property ${propertyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process recent bookings for property ${propertyId}: ${error.message}`,
      );

      // Update the sync log with the error
      await this.prismaService.syncLog.update({
        where: { id: syncLogId },
        data: {
          status: SyncStatus.ERROR,
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  private async upsertBooking(
    propertyId: number | string,
    bookingData: Beds24Booking,
  ): Promise<void> {
    const bookingId = bookingData.id?.toString();
    if (!bookingId) {
      this.logger.warn(
        `Skipping booking without ID for property ${propertyId}`,
      );
      return;
    }

    try {
      // Check if booking exists
      const existingBooking = await this.prismaService.bookings.findUnique({
        where: { booking_id: bookingId },
      });

      // Get room ID if it exists
      // let roomId: any = bookingData.roomId?.toString();

      // // If roomId is provided, verify it exists in the database
      // if (roomId) {
      //   const roomExists = await this.prismaService.rooms.findUnique({
      //     where: { id: parseInt(roomId, 10) },
      //   });

      //   if (!roomExists) {
      //     this.logger.warn(
      //       `Room with ID ${roomId} not found in database. Setting roomId to null for booking ${bookingId}`,
      //     );
      //     roomId = null; // Set to null if not found
      //   }
      // }

      // // Handle channel_reference - check if it's a unique value when it exists
      // let channelReference = bookingData.channel;

      // // If a channel_reference is provided, check if it's already used by another booking
      // if (channelReference) {
      //   // Check if this reference exists on another booking (not this one)
      //   const existingWithReference =
      //     await this.prismaService.bookings.findFirst({
      //       where: {
      //         channel_reference: channelReference,
      //         booking_id: { not: bookingId }, // Exclude current booking
      //       },
      //     });

      //   if (existingWithReference) {
      //     this.logger.warn(
      //       `channel_reference '${channelReference}' already exists in another booking. ` +
      //         `Making it unique by appending booking ID for booking ${bookingId}`,
      //     );
      //     // Make it unique by appending booking ID
      //     channelReference = `${channelReference}_${bookingId}`;
      //   }
      // }

      // Format property ID as string
      const propId = propertyId.toString();

      // Create booking data model
      const bookingModel: BookingModel = {
        propertyId: propId,
        booking_id: bookingId,
        guestId:
          bookingData?.guests && bookingData?.guests[0]?.id
            ? bookingData.guests[0].id
            : null,
        guest_name:
          [bookingData.firstName, bookingData.lastName]
            .filter(Boolean)
            .join(' ') || 'Unknown Guest',
        guest_email: bookingData?.guests ? bookingData.guests[0].email : null,
        guest_phone: bookingData?.guests ? bookingData.guests[0].phone : null,
        note: bookingData.notes || bookingData.comments || bookingData.message,
        num_adult: bookingData.numAdult || 1,
        num_children: bookingData.numChild || 0,
        country: bookingData.country,
        arrival: new Date(bookingData.arrival),
        departure: new Date(bookingData.departure),
        total_revenue: bookingData.price
          ? parseFloat(bookingData.price.toString())
          : 0,
        commission: bookingData.commission
          ? parseFloat(bookingData.commission.toString())
          : 0,
        adr: this.calculateADR(bookingData),
        status: bookingData.status || 'unknown',
        channel: bookingData.apiSource,
        channel_reference: bookingData.channel || bookingData.apiSource,
        roomId: bookingData?.roomId
          ? bookingData.roomId.toString()
          : 'Unknown Room ID',
      };

      // Start a transaction
      await this.prismaService.$transaction(async (tx) => {
        if (existingBooking) {
          // Update existing booking
          await tx.bookings.update({
            where: { id: existingBooking.id },
            data: bookingModel,
          });

          // Delete existing booking days for this booking
          await tx.booking_days.deleteMany({
            where: { bookingId: existingBooking.id },
          });
        } else {
          // Create new booking
          await tx.bookings.create({
            data: bookingModel,
          });
        }

        // Calculate booking days
        if (
          bookingModel.arrival &&
          bookingModel.departure &&
          bookingModel.total_revenue
        ) {
          const booking = await tx.bookings.findUnique({
            where: { booking_id: bookingId },
          });

          if (booking) {
            // Calculate days between arrival and departure
            const arrivalDate = new Date(bookingModel.arrival);
            const departureDate = new Date(bookingModel.departure);
            const nights = Math.max(
              1,
              Math.floor(
                (departureDate.getTime() - arrivalDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            );

            // Calculate per-day revenue
            const dailyRevenue = bookingModel.total_revenue / nights;

            // Create booking days
            const bookingDaysData: BookingDayModel[] = [];
            const currentDate = new Date(arrivalDate);

            for (let i = 0; i < nights; i++) {
              bookingDaysData.push({
                bookingId: booking.id,
                propertyId: propId,
                date: new Date(currentDate),
                revenue: dailyRevenue,
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }

            // Insert booking days
            await tx.booking_days.createMany({
              data: bookingDaysData,
            });
          }
        }
      });
    } catch (error) {
      this.logger.error(
        `Error upserting booking ${bookingId}: ${error.message}`,
      );
      throw error;
    }
  }

  private calculateADR(bookingData: Beds24Booking): number {
    if (!bookingData.price) return 0;

    const price =
      typeof bookingData.price === 'string'
        ? parseFloat(bookingData.price)
        : bookingData.price;

    const nights = this.calculateNights(
      bookingData.arrival,
      bookingData.departure,
    );
    return nights > 0 ? price / nights : price;
  }

  private calculateNights(
    arrivalDate: string | Date,
    departureDate: string | Date,
  ): number {
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    return Math.max(
      1,
      Math.floor(
        (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  }
}
