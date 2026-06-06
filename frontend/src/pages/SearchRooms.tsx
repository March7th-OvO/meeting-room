import { useState } from 'react';
import { Calendar, Monitor, Search as SearchIcon, Users } from 'lucide-react';
import { MeetingRoom } from '../types';

interface SearchRoomsProps {
  rooms: MeetingRoom[];
  onBookClick: (roomId: number) => void;
}

export default function SearchRooms({ rooms, onBookClick }: SearchRoomsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = room.capacity >= minCapacity;
    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">Find a Room</h2>
        <p className="text-slate-500 mt-1">Browse all rooms synced from the backend service.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Search by room name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="w-full md:w-56 flex items-center gap-2">
          <label className="text-sm text-slate-600 whitespace-nowrap">Min capacity</label>
          <input
            type="number"
            min="0"
            className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={minCapacity}
            onChange={(event) => setMinCapacity(Number(event.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
                <div className="mt-1 flex items-center text-sm text-slate-500">
                  <Users className="mr-1.5 h-4 w-4 text-slate-400" />
                  Capacity {room.capacity}
                </div>
                {room.location ? <div className="mt-1 text-xs text-slate-400">{room.location}</div> : null}
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  room.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {room.status}
              </span>
            </div>

            <div className="p-5 flex-1 bg-slate-50/60">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Equipment</h4>
              <ul className="space-y-2">
                {room.equipment.map((item) => (
                  <li key={item} className="flex items-center text-sm text-slate-700">
                    <Monitor className="mr-2 h-4 w-4 text-slate-400" />
                    {item}
                  </li>
                ))}
                {room.equipment.length === 0 ? <li className="text-sm text-slate-400 italic">No equipment listed</li> : null}
              </ul>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <button
                onClick={() => onBookClick(room.id)}
                disabled={room.status !== 'available'}
                className={`w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-colors ${
                  room.status === 'available' ? 'bg-slate-950 hover:bg-slate-800' : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book room
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
