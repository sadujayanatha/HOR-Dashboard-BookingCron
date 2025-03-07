/**
 * Types and interfaces for Beds24 API responses
 */

export interface Beds24ApiResponse<T> {
  success: boolean;
  type: string;
  count: number;
  pages?: {
    nextPageExists: boolean;
    nextPageLink: string;
  };
  data: T[];
}

export interface Beds24Property {
  beds24_id?: string;
  propertyId?: string;
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  checkinTimeFrom?: string | null;
  checkinTimeTo?: string | null;
  checkoutTime?: string | null;
  specialInstructions?: string | null;
  status?: string | null;
  rooms?: Beds24Room[];
  // Add other fields as needed
}

export interface Beds24Room {
  id: number;
  name: string;
  quantity?: number;
  roomQty?: number;
  type?: number;
  maxGuests?: number;
  maxPeople?: number;
  beds?: number;
  bedrooms?: number;
  bathrooms?: number;
  featured?: boolean;
  status?: boolean;
  rates?: number;
  // Add other fields as needed
}

export interface Beds24Booking {
  id: number;
  propertyId: number;
  apiSourceId?: number;
  apiSource?: string;
  channel?: string;
  bookingGroup?: {
    master: number;
    ids: number[];
  };
  masterId?: number;
  roomId?: number;
  unitId?: number;
  roomQty?: number;
  status: string;
  arrival: string;
  departure: string;
  numAdult: number;
  numChild: number;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  country?: string;
  price?: number;
  deposit?: number;
  tax?: number;
  commission?: number;
  notes?: string;
  comments?: string;
  message?: string;
  reference?: string;
  apiReference?: string;
  bookingTime?: string;
  modifiedTime?: string;
  cancelTime?: string;
  guests?: Beds24Guest[];
}

export interface Beds24Guest {
  id: number;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  country?: string;
}

export interface Beds24BookingsQueryParams {
  authentication?: {
    apiKey: string;
  };
  propertyId?: number[];
  roomId?: number[];
  arrivalFrom?: string;
  arrivalTo?: string;
  departureFrom?: string;
  departureTo?: string;
  modifiedFrom?: string;
  modifiedTo?: string;
  page?: number;
  pageSize?: number;
  filter?: string;
  channel?: string;
  status?: string;
}

export interface Beds24BookingsResult {
  bookings: Beds24Booking[];
  hasNextPage: boolean;
  nextPageLink?: string | undefined | null;
  totalCount?: number;
}
