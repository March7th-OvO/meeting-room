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
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">审批管理</h2>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">待审批申请</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
              待处理 {pendingBookings.length}
            </span>
          </div>

          <ul className="divide-y divide-slate-100">
            {pendingBookings.length === 0 ? (
              <li className="p-6 text-center text-slate-500 text-sm">暂无待审批的预约申请</li>
            ) : (
              pendingBookings.map((booking) => (
                <li key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h4 className="text-md font-medium text-slate-800">申请人 #{booking.userId}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="font-medium text-slate-800">会议室:</span> {getRoomName(booking.roomId)} |
                        <span className="font-medium ml-2 text-slate-800">时间:</span> {booking.bookingDate} {booking.startTime}-{booking.endTime}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-800">事由:</span> {booking.purpose}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onUpdateStatus(booking.id, { status: 'approved', approval_comment: '已通过' })}
                        disabled={busy}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors"
                      >
                        批准
                      </button>
                      <button
                        onClick={() => onUpdateStatus(booking.id, { status: 'rejected', approval_comment: '已拒绝' })}
                        disabled={busy}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
                      >
                        驳回
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">已处理预约</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {processedBookings.slice(0, 10).map((booking) => (
            <li key={booking.id} className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-medium text-slate-800">
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
