import { FormEvent, useMemo, useState } from 'react';
import { MeetingRoom, RoomPayload } from '../../types';
import { getRoomStatusLabel } from '../../lib/labels';

interface RoomManagementProps {
  rooms: MeetingRoom[];
  onAddRoom: (room: RoomPayload) => Promise<void>;
  onUpdateRoom: (roomId: number, room: Partial<RoomPayload>) => Promise<void>;
  onDeleteRoom: (roomId: number) => Promise<void>;
  busy: boolean;
}

const emptyForm: RoomPayload = {
  name: '',
  capacity: 4,
  status: 'available',
  location: '',
  description: '',
  equipment: [],
};

export default function RoomManagement({ rooms, onAddRoom, onUpdateRoom, onDeleteRoom, busy }: RoomManagementProps) {
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [form, setForm] = useState<RoomPayload>(emptyForm);

  const isEditing = editingRoomId !== null;
  const submitLabel = useMemo(() => (isEditing ? '更新会议室' : '创建会议室'), [isEditing]);

  function fillForm(room: MeetingRoom) {
    setEditingRoomId(room.id);
    setForm({
      name: room.name,
      capacity: room.capacity,
      status: room.status,
      location: room.location ?? '',
      description: room.description ?? '',
      equipment: room.equipment,
    });
  }

  function resetForm() {
    setEditingRoomId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      equipment: form.equipment.filter(Boolean),
    };

    try {
      if (isEditing && editingRoomId !== null) {
        await onUpdateRoom(editingRoomId, payload);
      } else {
        await onAddRoom(payload);
      }

      resetForm();
    } catch {
      // Parent layout already shows the backend error banner.
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-semibold text-slate-900">会议室列表</h2>
            <p className="text-slate-500 text-sm mt-1">通过管理员 API 管理会议室及其设备列表。</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">名称</th>
                  <th className="px-6 py-3 font-semibold">容量</th>
                  <th className="px-6 py-3 font-semibold">设备</th>
                  <th className="px-6 py-3 font-semibold">状态</th>
                  <th className="px-6 py-3 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{room.name}</div>
                      {room.location ? <div className="text-xs text-slate-400 mt-1">{room.location}</div> : null}
                    </td>
                    <td className="px-6 py-4">{room.capacity}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((item) => (
                          <span key={item} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${room.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {getRoomStatusLabel(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => fillForm(room)} className="text-cyan-700 hover:text-cyan-900 mr-3">
                        编辑
                      </button>
                      <button onClick={() => onDeleteRoom(room.id)} disabled={busy} className="text-rose-600 hover:text-rose-700 disabled:opacity-60">
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-950 text-white rounded-3xl p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold">{submitLabel}</h3>
            <p className="text-slate-300 text-sm mt-1">设备项请使用逗号分隔。</p>
          </div>

          <div>
            <label className="block text-sm mb-1">名称</label>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">容量</label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) || 1 }))}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">状态</label>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as RoomPayload['status'] }))}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5"
              >
                <option value="available">可用</option>
                <option value="maintenance">维护中</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">位置</label>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">描述</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">设备</label>
            <input
              value={form.equipment.join(', ')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  equipment: event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                }))
              }
              className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5"
              placeholder="投影仪，白板"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-cyan-400 text-slate-950 px-4 py-2.5 font-medium disabled:opacity-60">
              {submitLabel}
            </button>
            {isEditing ? (
              <button type="button" onClick={resetForm} className="rounded-xl border border-white/20 px-4 py-2.5">
                重置
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
