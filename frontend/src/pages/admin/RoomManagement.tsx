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
  const [equipmentInput, setEquipmentInput] = useState('');

  const isEditing = editingRoomId !== null;
  const submitLabel = useMemo(() => (isEditing ? '更新会议室' : '新增会议室'), [isEditing]);

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
    setEquipmentInput('');
  }

  function resetForm() {
    setEditingRoomId(null);
    setForm(emptyForm);
    setEquipmentInput('');
  }

  function addEquipment() {
    const trimmed = equipmentInput.trim();
    if (trimmed === '') return;
    setForm((current) => {
      if (current.equipment.includes(trimmed)) return current;
      return { ...current, equipment: [...current.equipment, trimmed] };
    });
    setEquipmentInput('');
  }

  function removeEquipment(index: number) {
    setForm((current) => ({
      ...current,
      equipment: current.equipment.filter((_, i) => i !== index),
    }));
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">会议室管理</h2>
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          {isEditing ? '新建会议室' : '重置表单'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">会议室名称</th>
                  <th className="px-6 py-3 font-semibold">容量</th>
                  <th className="px-6 py-3 font-semibold">设备</th>
                  <th className="px-6 py-3 font-semibold">状态</th>
                  <th className="px-6 py-3 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{room.name}</div>
                      {room.location ? <div className="text-xs text-slate-400 mt-1">{room.location}</div> : null}
                    </td>
                    <td className="px-6 py-4">{room.capacity} 人</td>
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {getRoomStatusLabel(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => fillForm(room)} className="text-blue-600 hover:text-blue-800 hover:underline mr-3">
                        编辑
                      </button>
                      <button
                        onClick={() => onDeleteRoom(room.id)}
                        disabled={busy}
                        className="text-red-500 hover:text-red-700 hover:underline disabled:opacity-60"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">{submitLabel}</h3>
            <p className="text-sm text-slate-500 mt-1">逐项输入设备名称并点击添加。</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">容量</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) || 1 }))}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as RoomPayload['status'] }))}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">可用</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">位置</label>
              <input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">设备</label>
              <div className="flex gap-2">
                <input
                  value={equipmentInput}
                  onChange={(event) => setEquipmentInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addEquipment();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入设备名称"
                />
                <button
                  type="button"
                  onClick={addEquipment}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition border border-slate-300"
                >
                  添加
                </button>
              </div>
              {form.equipment.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.equipment.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeEquipment(index)}
                        className="ml-1 text-blue-400 hover:text-red-500 transition-colors leading-none text-lg"
                        title="移除此设备"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitLabel}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  取消编辑
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
