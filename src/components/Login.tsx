import React, { useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data';
import { Building2, UserCircle2, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find(u => u.username === username);
    if (user) {
      onLogin(user);
    } else {
      setError('User not found. Try "user1", "user2", or "admin".');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 text-center mb-2">
            会议室预约管理系统
          </h2>
          <p className="text-slate-500 text-center text-sm mb-8">
            登录以预约会议室或进入管理后台
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="输入 user1 或 admin"
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors"
            >
              登录
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              测试账号
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setUsername('user1')}
                className="flex items-center p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div>
                  <div className="text-sm text-slate-700 font-medium">user1</div>
                  <div className="text-xs text-slate-500">普通用户</div>
                </div>
              </button>
              <button 
                onClick={() => setUsername('admin')}
                className="flex items-center p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                <div>
                  <div className="text-sm text-slate-700 font-medium">admin</div>
                  <div className="text-xs text-slate-500">管理员</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
