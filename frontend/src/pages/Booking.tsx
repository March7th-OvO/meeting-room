import { FormEvent, useEffect, useState } from 'react';
import { BookingPayload, MeetingRoom } from '../types';

interface BookingPageProps {
  rooms: MeetingRoom[];
  onBook: (booking: BookingPayload) => Promise<void>;
  preselectedRoomId?: number;
  onCancel: () => void;
}

export default function BookingPage({ rooms, onBook, preselectedRoomId, onCancel }: BookingPageProps) {
  const availableRooms = rooms.filter((room) => room.status === 'available');

  const [roomId, setRoomId] = useState<number>(preselectedRoomId || availableRooms[0]?.id || 0);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setRoomId(preselectedRoomId || availableRooms[0]?.id || 0);
  }, [preselectedRoomId, rooms, availableRooms]);

  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .split('T')[0];
    setBookingDate(localDate);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!roomId || !bookingDate || !startTime || !endTime || !purpose) {
      setError('请填写所有必填项');
      return;
    }

    if (startTime >= endTime) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    try {
      await onBook({
        room_id: roomId,
        booking_date: bookingDate,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        purpose,
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : '预约失败');
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-semibold text-slate-800">会议室预约申请</h2>
          <p className="mt-1 text-sm text-slate-500">填写以下表单以申请使用会议室，提交后将等待管理员审批。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error ? (
            <div className="p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ) : null}

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-slate-700">
              选择会议室
            </label>
            <select
              id="room"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border text-slate-800"
              value={roomId}
              onChange={(event) => setRoomId(Number(event.target.value))}
            >
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.capacity}人)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">
              日期
            </label>
            <input
              type="date"
              id="date"
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
              className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-slate-700">
                开始时间
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-slate-700">
                结束时间
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-slate-700">
              会议事由
            </label>
            <textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="例如：部门周会、客户来访等"
              className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2 text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              提交申请
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
