import { Booking, BookingPayload, BookingStatusUpdatePayload, Credentials, MeetingRoom, RoomPayload, StatisticsBundle, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

type RawRoom = {
  id: number;
  name: string;
  capacity: number;
  status: MeetingRoom['status'];
  location?: string | null;
  description?: string | null;
  equipment: string[];
};

type RawBooking = {
  id: number;
  room_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: Booking['status'];
  approval_comment?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
};

type RawNamedValue = {
  name: string;
  value: number;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  let payload: ApiEnvelope<T> | { detail?: string };
  try {
    payload = await response.json();
  } catch {
    throw new Error('Unexpected server response');
  }

  if (!response.ok) {
    const detail = 'detail' in payload && payload.detail ? payload.detail : 'Request failed';
    throw new Error(detail);
  }

  if (!('data' in payload)) {
    throw new Error('Malformed API response');
  }

  return payload.data;
}

function mapRoom(room: RawRoom): MeetingRoom {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    status: room.status,
    location: room.location ?? '',
    description: room.description ?? '',
    equipment: room.equipment,
  };
}

function mapBooking(booking: RawBooking): Booking {
  return {
    id: booking.id,
    roomId: booking.room_id,
    userId: booking.user_id,
    bookingDate: booking.booking_date,
    startTime: booking.start_time.slice(0, 5),
    endTime: booking.end_time.slice(0, 5),
    purpose: booking.purpose,
    status: booking.status,
    approvalComment: booking.approval_comment ?? null,
    approvedBy: booking.approved_by ?? null,
    approvedAt: booking.approved_at ?? null,
  };
}

export async function login(credentials: Credentials) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(token: string) {
  return request<User>('/auth/me', {}, token);
}

export async function listRooms(token: string) {
  const data = await request<RawRoom[]>('/rooms', {}, token);
  return data.map(mapRoom);
}

export async function createRoom(token: string, payload: RoomPayload) {
  const data = await request<RawRoom>(
    '/admin/rooms',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
  return mapRoom(data);
}

export async function updateRoom(token: string, roomId: number, payload: Partial<RoomPayload>) {
  const data = await request<RawRoom>(
    `/admin/rooms/${roomId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
  return mapRoom(data);
}

export async function deleteRoom(token: string, roomId: number) {
  return request<boolean>(`/admin/rooms/${roomId}`, { method: 'DELETE' }, token);
}

export async function createBooking(token: string, payload: BookingPayload) {
  const data = await request<RawBooking>(
    '/bookings',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
  return mapBooking(data);
}

export async function getMyBookings(token: string) {
  const data = await request<RawBooking[]>('/bookings/me', {}, token);
  return data.map(mapBooking);
}

export async function cancelBooking(token: string, bookingId: number) {
  const data = await request<RawBooking>(
    `/bookings/${bookingId}/cancel`,
    { method: 'PATCH' },
    token,
  );
  return mapBooking(data);
}

export async function getAdminBookings(token: string) {
  const data = await request<RawBooking[]>('/admin/bookings', {}, token);
  return data.map(mapBooking);
}

export async function updateBookingStatus(token: string, bookingId: number, payload: BookingStatusUpdatePayload) {
  const data = await request<RawBooking>(
    `/admin/bookings/${bookingId}/status`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
  return mapBooking(data);
}

export async function getStatistics(token: string): Promise<StatisticsBundle> {
  const [overview, roomUsage, bookingStatus] = await Promise.all([
    request<{ room_count: number; approved_booking_count: number; pending_booking_count: number }>(
      '/admin/statistics/overview',
      {},
      token,
    ),
    request<RawNamedValue[]>('/admin/statistics/room-usage', {}, token),
    request<RawNamedValue[]>('/admin/statistics/booking-status', {}, token),
  ]);

  return {
    overview: {
      roomCount: overview.room_count,
      approvedBookingCount: overview.approved_booking_count,
      pendingBookingCount: overview.pending_booking_count,
    },
    roomUsage,
    bookingStatus,
  };
}
