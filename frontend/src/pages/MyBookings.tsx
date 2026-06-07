import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Booking, MeetingRoom } from '../types';
import { getBookingStatusLabel } from '../lib/labels';

interface MyBookingsProps {
  bookings: Booking[];
  rooms: MeetingRoom[];
  onCancel: (bookingId: number) => Promise<void>;
  busy: boolean;
}

export default function MyBookings({ bookings, rooms, onCancel, busy }: MyBookingsProps) {
  const getRoomName = (roomId: number) => rooms.find((room) => room.id === roomId)?.name || `会议室 #${roomId}`;

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> {getBookingStatusLabel(status)}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> {getBookingStatusLabel(status)}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> {getBookingStatusLabel(status)}
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
            {getBookingStatusLabel(status)}
          </span>
        );
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
            {[...bookings]
              .sort((a, b) => `${b.bookingDate}${b.startTime}`.localeCompare(`${a.bookingDate}${a.startTime}`))
              .map((booking, index) => (
                <motion.li
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 sm:p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-medium text-slate-800">{getRoomName(booking.roomId)}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-slate-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                        {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-800">事由：</span> {booking.purpose}
                      </p>
                      {booking.approvalComment ? (
                        <p className="mt-1 text-sm text-slate-500">
                          <span className="font-medium text-slate-800">审批备注：</span> {booking.approvalComment}
                        </p>
                      ) : null}
                    </div>
                    {booking.status === 'pending' || booking.status === 'approved' ? (
                      <button
                        onClick={() => onCancel(booking.id)}
                        disabled={busy}
                        className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-60"
                      >
                        取消预约
                      </button>
                    ) : null}
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
