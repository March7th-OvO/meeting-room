import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
} from 'lucide-react';
import { User } from '../types';
import { getRoleLabel } from '../lib/labels';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  banner?: string;
  busy?: boolean;
}

export default function Layout({ user, onLogout, children, currentView, onNavigate, banner, busy }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userNavigation = [
    { name: '查找会议室', id: 'search', icon: Search },
    { name: '新建预约', id: 'book', icon: CalendarPlus },
    { name: '我的预约', id: 'my-bookings', icon: CalendarDays },
  ];

  const adminNavigation = [
    { name: '会议室管理', id: 'manage-rooms', icon: Settings },
    { name: '统计', id: 'statistics', icon: BarChart3 },
    { name: '审批管理', id: 'manage-bookings', icon: LayoutDashboard },
  ];

  const navigation = user.role === 'admin' ? [...userNavigation, ...adminNavigation] : userNavigation;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 font-sans">
      {sidebarOpen ? (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 text-slate-300 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 text-white font-bold text-xl flex items-center border-b border-slate-800">
          <Building2 className="w-8 h-8 mr-2 text-cyan-400" />
          <span>Meeting Room</span>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-white/10 border-l-4 border-cyan-400 text-white'
                    : 'hover:bg-slate-900 border-l-4 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-sm">
          <div className="text-white font-medium">{user.username}</div>
          <div className="text-slate-400">{getRoleLabel(user.role)}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 bg-white shadow-sm px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500">
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-slate-900 font-semibold text-lg">工作台总览</h1>
              <p className="text-slate-500 text-sm">已连接 FastAPI 和 SQLite</p>
            </div>
          </div>

          <button onClick={onLogout} className="text-slate-700 hover:text-slate-900 flex items-center transition-colors">
            <LogOut className="h-4 w-4 mr-1" />
            <span>{busy ? '处理中...' : '退出登录'}</span>
          </button>
        </header>

        {banner ? (
          <div className="mx-4 mt-4 lg:mx-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {banner}
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
