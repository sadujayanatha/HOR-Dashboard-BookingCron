import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Beds24ApiResponse,
  Beds24Booking,
  Beds24BookingsQueryParams,
  Beds24BookingsResult,
  Beds24Property,
} from './interfaces/beds24-api.interface';
import { PropertyBookingsOptions } from './interfaces/sync.interface';

@Injectable()
export class Beds24ApiService {
  private readonly logger = new Logger(Beds24ApiService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BEDS24_API_KEY');
    this.apiUrl = this.configService.get<string>(
      'BEDS24_API_URL',
      'https://api.beds24.com/v2',
    );
  }

  /**
   * Get all properties from Beds24
   */
  async getProperties(): Promise<Beds24Property[]> {
    try {
      const response = await axios.post<Beds24ApiResponse<Beds24Property>>(
        `${this.apiUrl}/properties`,
        {
          authentication: {
            apiKey: this.apiKey,
          },
        },
      );

      if (!response.data || !response.data.success) {
        this.logger.warn(
          'API call to get properties failed or returned unsuccessful response',
        );
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      this.logger.error(`Failed to fetch properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get bookings with flexible search parameters
   */
  async getBookings(
    params: Beds24BookingsQueryParams,
  ): Promise<Beds24BookingsResult> {
    try {
      const requestParams: any = {
        authentication: {
          apiKey: this.apiKey,
        },
      };

      // Add query parameters if provided
      if (params.propertyId && params.propertyId.length > 0) {
        requestParams.propertyId = params.propertyId;
      }

      if (params.roomId && params.roomId.length > 0) {
        requestParams.roomId = params.roomId;
      }

      if (params.arrivalFrom) {
        requestParams.arrivalFrom = params.arrivalFrom;
      }

      if (params.arrivalTo) {
        requestParams.arrivalTo = params.arrivalTo;
      }

      if (params.departureFrom) {
        requestParams.departureFrom = params.departureFrom;
      }

      if (params.departureTo) {
        requestParams.departureTo = params.departureTo;
      }

      if (params.modifiedFrom) {
        requestParams.modifiedFrom = params.modifiedFrom;
      }

      if (params.modifiedTo) {
        requestParams.modifiedTo = params.modifiedTo;
      }

      if (params.filter) {
        requestParams.filter = params.filter;
      }

      if (params.channel) {
        requestParams.channel = params.channel;
      }

      if (params.status) {
        requestParams.status = params.status;
      }

      // Pagination parameters
      if (params.page) {
        requestParams.page = params.page;
      }

      if (params.pageSize) {
        requestParams.pageSize = params.pageSize;
      }

      const response = await axios.post<Beds24ApiResponse<Beds24Booking>>(
        `${this.apiUrl}/bookings`,
        requestParams,
      );

      if (!response.data || !response.data.success) {
        this.logger.warn(
          'API call to get bookings failed or returned unsuccessful response',
        );
        return { bookings: [], hasNextPage: false };
      }

      const hasNextPage = response.data.pages?.nextPageExists || false;
      const nextPageLink = response.data.pages?.nextPageLink || null;

      return {
        bookings: response.data.data || [],
        hasNextPage,
        nextPageLink,
        totalCount: response.data.count,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch bookings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get bookings for a specific property with pagination
   */
  async getBookingsForProperty(
    propertyId: number | string,
    options: PropertyBookingsOptions = {},
  ): Promise<Beds24BookingsResult> {
    const propId =
      typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;

    return this.getBookings({
      propertyId: [propId],
      arrivalFrom: options.fromDate,
      departureTo: options.toDate,
      page: options.page || 1,
      pageSize: options.pageSize || 500,
    });
  }

  /**
   * Get recently modified bookings
   */
  async getRecentBookings(
    propertyId: number | string,
    modifiedFrom: string,
  ): Promise<Beds24Booking[]> {
    const propId =
      typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;

    const result = await this.getBookings({
      propertyId: [propId],
      modifiedFrom,
    });

    return result.bookings;
  }

  /**
   * Get next page of bookings using next page information
   */
  async getNextPageBookings(
    nextPageLink: string,
  ): Promise<Beds24BookingsResult> {
    try {
      const response = await axios.get<Beds24ApiResponse<Beds24Booking>>(
        nextPageLink,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.data || !response.data.success) {
        this.logger.warn('API call to get next page of bookings failed');
        return { bookings: [], hasNextPage: false };
      }

      const hasNextPage = response.data.pages?.nextPageExists || false;
      const nextPageLink = response.data.pages?.nextPageLink || null;

      return {
        bookings: response.data.data || [],
        hasNextPage,
        nextPageLink,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch next page of bookings: ${error.message}`,
      );
      throw error;
    }
  }
}
