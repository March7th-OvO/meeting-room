import React, { useState } from 'react';
import { MeetingRoom, Booking } from '../types';
import { Search as SearchIcon, Users, Monitor, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchRoomsProps {
  rooms: MeetingRoom[];
  onBookClick: (roomId: string) => void;
}

export default function SearchRooms({ rooms, onBookClick }: SearchRoomsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = room.capacity >= minCapacity;
    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">查询会议室</h2>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="搜索会议室名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64 flex items-center gap-2">
          <label className="text-sm text-slate-600 whitespace-nowrap">最小容量:</label>
          <input
            type="number"
            min="0"
            className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{room.name}</h3>
                <div className="mt-1 flex items-center text-sm text-slate-500">
                  <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                  容纳 {room.capacity} 人
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1.5 ${room.status === 'available' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                {room.status === 'available' ? '可预约' : '维护中'}
              </span>
            </div>
            <div className="p-5 flex-1 bg-slate-50/50">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">设备设施</h4>
              <ul className="space-y-2">
                {room.equipment.map((eq, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-700">
                    <Monitor className="flex-shrink-0 mr-2 h-4 w-4 text-slate-400" />
                    {eq}
                  </li>
                ))}
                {room.equipment.length === 0 && (
                  <li className="text-sm text-slate-400 italic">无特殊设备</li>
                )}
              </ul>
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
              <button
                onClick={() => onBookClick(room.id)}
                disabled={room.status !== 'available'}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                  room.status === 'available' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                立即预约
              </button>
            </div>
          </motion.div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <SearchIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-800">暂无结果</h3>
            <p className="mt-1 text-sm text-slate-500">没有找到符合条件的会议室。</p>
          </div>
        )}
      </div>
    </div>
  );
}
