import React from 'react';
import { Booking, MeetingRoom } from '../types';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MyBookingsProps {
  bookings: Booking[];
  rooms: MeetingRoom[];
}

export default function MyBookings({ bookings, rooms }: MyBookingsProps) {
  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || '未知会议室';
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> 待审批</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/>已通过</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> 已驳回</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">已取消</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">我的预约</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {bookings.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            { bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((booking, index) => (
              <motion.li 
                key={booking.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 sm:p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-slate-800">
                        {getRoomName(booking.roomId)}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                      {booking.date} | {booking.startTime} - {booking.endTime}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">事由：</span> {booking.purpose}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    {/* Add action buttons here if needed, like Cancel Booking */}
                    {booking.status === 'pending' && (
                       <button className="text-sm text-red-500 hover:text-red-700 font-medium">取消预约</button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500">暂无预约记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
