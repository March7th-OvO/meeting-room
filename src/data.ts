import { User, MeetingRoom, Booking } from './types';

export const mockUsers: User[] = [
  { id: 'u1', username: 'user1', role: 'user' },
  { id: 'u2', username: 'user2', role: 'user' },
  { id: 'a1', username: 'admin', role: 'admin' },
];

export const mockRooms: MeetingRoom[] = [
  { id: 'r1', name: 'Boardroom A', capacity: 20, equipment: ['Projector', 'Whiteboard', 'Video Conferencing'], status: 'available' },
  { id: 'r2', name: 'Meeting Room B', capacity: 8, equipment: ['Whiteboard', 'TV'], status: 'available' },
  { id: 'r3', name: 'Huddle Room C', capacity: 4, equipment: ['Whiteboard'], status: 'available' },
  { id: 'r4', name: 'Conference Room D', capacity: 15, equipment: ['Projector', 'Polycom'], status: 'maintenance' },
];

export const mockBookings: Booking[] = [
  { id: 'b1', roomId: 'r2', userId: 'u1', date: '2026-06-07', startTime: '10:00', endTime: '11:00', status: 'approved', purpose: 'Weekly Sync' },
  { id: 'b2', roomId: 'r1', userId: 'u2', date: '2026-06-08', startTime: '14:00', endTime: '16:00', status: 'pending', purpose: 'Quarterly Planning' },
  { id: 'b3', roomId: 'r3', userId: 'u1', date: '2026-06-09', startTime: '09:00', endTime: '10:30', status: 'pending', purpose: 'Client Interview' },
];
