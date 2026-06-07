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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">我的预约</h2>
        <p className="text-slate-500 mt-1">跟踪后端工作流中的状态变化。</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {bookings.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {[...bookings]
              .sort((a, b) => `${b.bookingDate}${b.startTime}`.localeCompare(`${a.bookingDate}${a.startTime}`))
              .map((booking) => (
                <li key={booking.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-medium text-slate-900">{getRoomName(booking.roomId)}</h3>
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                          {getBookingStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-900">用途：</span> {booking.purpose}
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
                        className="text-sm text-rose-600 hover:text-rose-700 font-medium disabled:opacity-60"
                      >
                        取消预约
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-slate-500">暂无预约记录。</div>
        )}
      </div>
    </div>
  );
}
