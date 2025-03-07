/**
 * Interfaces for database models
 */

export interface PropertyModel {
  beds24_id: string;
  name: string;
  address?: string | undefined | null;
  city?: string | undefined | null;
  country?: string | undefined | null;
  checkinStart?: string | undefined | null;
  checkinEnd?: string | undefined | null;
  checkoutStart?: string | undefined | null;
  specialNote?: string | undefined | null;
  published: boolean;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
}

export interface RoomModel {
  room_id: string;
  room_name: string;
  qty: number;
  type: number;
  rates: number;
  num_guests: number;
  num_beds: number;
  num_bedrooms: number;
  num_baths: number;
  featured: boolean;
  status: boolean;
  propertyId: string;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
}

export interface BookingModel {
  id?: number;
  propertyId: string;
  booking_id: string;
  guestId: number | null;
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  note?: string;
  num_adult: number;
  num_children: number;
  country?: string;
  arrival: Date;
  departure: Date;
  total_revenue: number;
  commission?: number;
  adr?: number;
  owner_payout?: number;
  hor_payout?: number;
  status: string;
  channel?: string;
  channel_reference?: string;
  roomId?: string | null;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
}

export interface BookingDayModel {
  bookingId: number;
  propertyId: string;
  date: Date;
  revenue: number;
}
