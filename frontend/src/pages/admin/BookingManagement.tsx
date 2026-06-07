import { Booking, BookingStatusUpdatePayload, MeetingRoom } from '../../types';
import { getBookingStatusLabel } from '../../lib/labels';

interface BookingManagementProps {
  bookings: Booking[];
  rooms: MeetingRoom[];
  onUpdateStatus: (bookingId: number, payload: BookingStatusUpdatePayload) => Promise<void>;
  busy: boolean;
}

export default function BookingManagement({ bookings, rooms, onUpdateStatus, busy }: BookingManagementProps) {
  const getRoomName = (roomId: number) => rooms.find((room) => room.id === roomId)?.name || `会议室 #${roomId}`;
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
  const processedBookings = bookings.filter((booking) => booking.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">审批队列</h2>
        <p className="text-slate-500 mt-1">待审批预约会在审批完成前阻塞冲突的时间段。</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">待审批请求</h3>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
            {pendingBookings.length} 条待处理
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {pendingBookings.length === 0 ? (
            <li className="p-6 text-center text-slate-500 text-sm">暂无待审批预约。</li>
          ) : (
            pendingBookings.map((booking) => (
              <li key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col xl:flex-row justify-between gap-4">
                  <div>
                    <h4 className="text-md font-medium text-slate-900">会议室：{getRoomName(booking.roomId)}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      用户 #{booking.userId} | {booking.bookingDate} {booking.startTime}-{booking.endTime}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">用途：{booking.purpose}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateStatus(booking.id, { status: 'approved', approval_comment: '已通过' })}
                      disabled={busy}
                      className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => onUpdateStatus(booking.id, { status: 'rejected', approval_comment: '已拒绝' })}
                      disabled={busy}
                      className="px-3 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-900">已处理预约</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {processedBookings.slice(0, 10).map((booking) => (
            <li key={booking.id} className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-medium text-slate-900">
                    {getRoomName(booking.roomId)} | 用户 #{booking.userId}
                  </div>
                  <div className="text-sm text-slate-500">
                    {booking.bookingDate} {booking.startTime}-{booking.endTime}
                  </div>
                </div>
                <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                  {getBookingStatusLabel(booking.status)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
