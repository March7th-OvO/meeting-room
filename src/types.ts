export type Role = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: 'available' | 'maintenance';
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string;
}
