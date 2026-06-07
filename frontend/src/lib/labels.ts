import type { Booking, MeetingRoom, Role } from '../types';

export const roleLabels: Record<Role, string> = {
  user: '普通用户',
  admin: '管理员',
};

export const roomStatusLabels: Record<MeetingRoom['status'], string> = {
  available: '可用',
  maintenance: '维护中',
};

export const bookingStatusLabels: Record<Booking['status'], string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已取消',
};

export function getRoleLabel(role: Role) {
  return roleLabels[role] ?? role;
}

export function getRoomStatusLabel(status: MeetingRoom['status']) {
  return roomStatusLabels[status] ?? status;
}

export function getBookingStatusLabel(status: Booking['status']) {
  return bookingStatusLabels[status] ?? status;
}

export const currentRoomUsageLabels: Record<string, string> = {
  in_use: '正在使用',
  under_review: '正在审核',
  idle: '空闲',
};

export function getCurrentRoomUsageLabel(status: string) {
  return currentRoomUsageLabels[status] ?? status;
}
