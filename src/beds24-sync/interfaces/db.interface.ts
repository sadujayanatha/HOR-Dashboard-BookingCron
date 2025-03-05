/**
 * Interfaces for database models
 */

export interface PropertyModel {
  beds24_id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  checkinStart?: string;
  checkinEnd?: string;
  checkoutStart?: string;
  specialNote?: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingModel {
  id?: number;
  propertyId: string;
  booking_id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
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
  roomId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingDayModel {
  bookingId: number;
  propertyId: string;
  date: Date;
  revenue: number;
}
