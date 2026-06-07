import { FormEvent, useState } from 'react';
import { Building2, KeyRound, UserCircle2 } from 'lucide-react';
import { Credentials } from '../types';

interface LoginProps {
  onLogin: (credentials: Credentials) => Promise<void>;
  busy: boolean;
  error: string;
}

const demoAccounts = [
  { username: 'user1', role: '普通用户' },
  { username: 'user2', role: '普通用户' },
  { username: 'admin', role: '管理员' },
];

export default function Login({ onLogin, busy, error }: LoginProps) {
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('123456');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await onLogin({ username, password });
    } catch {
      // Parent already exposes the error banner/text state.
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 text-center mb-2">会议室预约管理系统</h2>
          <p className="text-slate-500 text-center text-sm mb-8">登录以预约会议室或进入管理后台</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(event) => setUsername(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="user1"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors"
            >
              {busy ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">测试账号</h3>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword('123456');
                  }}
                  className="flex items-center p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left"
                >
                  <div>
                    <div className="text-sm text-slate-700 font-medium">{account.username}</div>
                    <div className="text-xs text-slate-500">{account.role}</div>
                  </div>
                  <div className="ml-auto text-[11px] text-slate-400">123456</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
