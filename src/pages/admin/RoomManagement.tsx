import React, { useState } from 'react';
import { MeetingRoom } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface RoomManagementProps {
  rooms: MeetingRoom[];
  onAddRoom: (room: Omit<MeetingRoom, 'id'>) => void;
  onUpdateRoom: (room: MeetingRoom) => void;
  onDeleteRoom: (roomId: string) => void;
}

export default function RoomManagement({ rooms, onAddRoom, onUpdateRoom, onDeleteRoom }: RoomManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">会议室管理</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus className="w-4 h-4 mr-2" />
          新增会议室
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">会议室名称</th>
                <th scope="col" className="px-6 py-3 font-semibold">容量</th>
                <th scope="col" className="px-6 py-3 font-semibold">设备</th>
                <th scope="col" className="px-6 py-3 font-semibold">状态</th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {room.name}
                  </td>
                  <td className="px-6 py-4">
                    {room.capacity} 人
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {room.equipment.map((eq, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {room.status === 'available' ? '可预约' : '维护中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    <button className="text-blue-600 hover:text-blue-800 hover:underline mr-3">编辑</button>
                    <button onClick={() => onDeleteRoom(room.id)} className="text-red-500 hover:text-red-700 hover:underline">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
