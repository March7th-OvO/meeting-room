export type Role = 'user' | 'admin';

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface MeetingRoom {
  id: number;
  name: string;
  capacity: number;
  equipment: string[];
  status: 'available' | 'maintenance';
  location?: string;
  description?: string;
}

export interface Booking {
  id: number;
  roomId: number;
  userId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string;
  approvalComment?: string | null;
  approvedBy?: number | null;
  approvedAt?: string | null;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface RoomPayload {
  name: string;
  capacity: number;
  status: MeetingRoom['status'];
  location?: string;
  description?: string;
  equipment: string[];
}

export interface BookingPayload {
  room_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
}

export interface BookingStatusUpdatePayload {
  status: 'approved' | 'rejected';
  approval_comment?: string;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface StatisticsBundle {
  overview: {
    roomCount: number;
    approvedBookingCount: number;
    pendingBookingCount: number;
  };
  roomUsage: NamedValue[];
  roomStatus: NamedValue[];
  currentRoomUsage: NamedValue[];
}
