import React from 'react';
import { Booking, MeetingRoom, User } from '../../types';
import { Check, X } from 'lucide-react';

interface BookingManagementProps {
  bookings: Booking[];
  rooms: MeetingRoom[];
  users: User[];
  onUpdateStatus: (bookingId: string, status: Booking['status']) => void;
}

export default function BookingManagement({ bookings, rooms, users, onUpdateStatus }: BookingManagementProps) {
  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name || '未知';
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.username || '未知';

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">审批管理</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">待审批申请</h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                待处理: {pendingBookings.length}
              </span>
            </div>
          </div>
          
          <ul className="divide-y divide-slate-100">
            {pendingBookings.length === 0 ? (
               <li className="p-6 text-center text-slate-500 text-sm">暂无待审批的预约申请</li>
            ) : pendingBookings.map(booking => (
              <li key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h4 className="text-md font-medium text-slate-800">申请人: {getUserName(booking.userId)}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-medium text-slate-800">会议室:</span> {getRoomName(booking.roomId)} | 
                      <span className="font-medium ml-2 text-slate-800">时间:</span> {booking.date} {booking.startTime}-{booking.endTime}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      <span className="font-medium text-slate-800">事由:</span> {booking.purpose}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onUpdateStatus(booking.id, 'approved')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> 批准
                    </button>
                    <button
                      onClick={() => onUpdateStatus(booking.id, 'rejected')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <X className="mr-1.5 h-4 w-4" /> 驳回
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
