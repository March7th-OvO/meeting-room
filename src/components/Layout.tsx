import React, { useState } from 'react';
import { User } from '../types';
import { 
  Building2, 
  Search, 
  CalendarPlus, 
  CalendarDays, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  BarChart3,
  Settings
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Layout({ user, onLogout, children, currentView, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userNavigation = [
    { name: '查询会议室', id: 'search', icon: Search },
    { name: '预约申请', id: 'book', icon: CalendarPlus },
    { name: '我的预约', id: 'my-bookings', icon: CalendarDays },
  ];

  const adminNavigation = [
    { name: '会议室管理', id: 'manage-rooms', icon: Settings },
    { name: '数据统计', id: 'statistics', icon: BarChart3 },
    { name: '审批管理', id: 'manage-bookings', icon: LayoutDashboard },
  ];

  const navigation = user.role === 'admin' 
    ? [...userNavigation, ...adminNavigation]
    : userNavigation;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Deep Dark Theme */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 text-white font-bold text-xl flex items-center border-b border-slate-800">
          <Building2 className="w-8 h-8 mr-2 text-blue-500" />
          <span>MRBS</span>
        </div>
        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="px-4 mb-2 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            用户功能
          </div>
          {userNavigation.map((item) => {
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
                    ? 'bg-white/10 border-l-4 border-blue-500 text-white' 
                    : 'hover:bg-slate-800 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : ''}`} />
                {item.name}
              </button>
            );
          })}
          
          {user.role === 'admin' && (
            <>
              <div className="px-4 mt-8 mb-2 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                管理员面板
              </div>
              {adminNavigation.map((item) => {
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
                        ? 'bg-white/10 border-l-4 border-blue-500 text-white' 
                        : 'hover:bg-slate-800 border-l-4 border-transparent text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : ''}`} />
                    {item.name}
                  </button>
                );
              })}
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase">
              {user.username.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-white">{user.username}</p>
              <p className="text-xs text-slate-400">{user.role === 'admin' ? '系统管理员' : '普通用户'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 w-full">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-slate-800 font-semibold text-lg hidden sm:block">
              会议室预约管理系统
            </h1>
          </div>
          <div className="flex items-center space-x-4 lg:space-x-6 text-sm text-slate-600">
            <span>欢迎，<strong className="text-slate-900">{user.username}</strong>!</span>
            <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
            <button
              onClick={onLogout}
              className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">退出登录</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
