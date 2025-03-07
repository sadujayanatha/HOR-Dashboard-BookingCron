/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  Beds24ApiResponse,
  Beds24Booking,
  Beds24BookingsQueryParams,
  Beds24BookingsResult,
  Beds24Property,
} from './interfaces/beds24-api.interface';
import { PropertyBookingsOptions } from './interfaces/sync.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class Beds24ApiService {
  private readonly logger = new Logger(Beds24ApiService.name);
  private readonly apiToken: string;
  private readonly apiUrl: string;
  private readonly organization?: string;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.apiToken = this.configService.get<string>('BEDS24_API_KEY', '');
    this.apiUrl = this.configService.get<string>(
      'BEDS24_API_URL',
      'https://api.beds24.com/v2',
    );
    this.organization = this.configService.get<string>(
      'BEDS24_ORGANIZATION',
      '',
    );

    if (!this.apiToken) {
      this.logger.warn(
        'BEDS24_API_TOKEN is not set. API calls will likely fail.',
      );
    }
  }

  /**
   * Get HTTP headers for Beds24 API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      token: this.apiToken,
    };

    // Add organization header if provided
    if (this.organization) {
      headers['organisation'] = this.organization;
    }

    return headers;
  }

  /**
   * Get all properties from the local database
   */
  async getProperties(): Promise<Beds24Property[]> {
    try {
      // Retrieve properties from the database
      const properties = await this.prismaService.properties.findMany({
        include: {
          rooms: true, // Include rooms related to each property
        },
      });

      if (!properties || properties.length === 0) {
        this.logger.warn('No properties found in the database');
        return [];
      }

      // Transform database properties to Beds24Property format
      const transformedProperties: Beds24Property[] = [];

      for (const property of properties) {
        // Try to parse the beds24_id as an integer, fallback to 0 if it fails
        const propertyId = property.beds24_id || '';

        // Create a property object that matches the Beds24Property interface
        const beds24Property: Beds24Property = {
          beds24_id: propertyId,
          name: property.name,
          address: property.address || undefined,
          city: property.city || undefined,
          country: property.country || undefined,
          checkinTimeFrom: property.checkinStart || undefined,
          checkinTimeTo: property.checkinEnd || undefined,
          checkoutTime: property.checkoutStart || undefined,
          specialInstructions: property.specialNote || undefined,
          status: property.published ? 'active' : 'inactive',
        };

        // Add rooms if they exist
        if (property.rooms && property.rooms.length > 0) {
          beds24Property.rooms = property.rooms.map((room) => ({
            id: parseInt(room.room_id) || 0,
            name: room.room_name,
            quantity: room.qty,
            type: room.type,
            maxGuests: room.num_guests,
            beds: room.num_beds,
            bedrooms: room.num_bedrooms,
            bathrooms: room.num_baths,
            featured: room.featured,
            status: room.status,
          }));
        }

        transformedProperties.push(beds24Property);
      }

      return transformedProperties;
    } catch (error) {
      this.logger.error(
        `Failed to fetch properties from database: ${error.message}`,
      );
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
      // Remove authentication from parameters since we're using headers
      const { ...requestParams } = params;

      const response = await axios.get<Beds24ApiResponse<Beds24Booking>>(
        `${this.apiUrl}/bookings`,
        { params: { ...requestParams }, headers: this.getHeaders() },
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
    } catch (error: any) {
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
    strNextPageLink: string,
  ): Promise<Beds24BookingsResult> {
    try {
      const response = await axios.get<Beds24ApiResponse<Beds24Booking>>(
        strNextPageLink,
        {
          headers: this.getHeaders(),
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
