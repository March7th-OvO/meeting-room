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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-950 text-white p-8">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-400/10 border border-cyan-300/30 p-3 rounded-2xl">
              <Building2 className="w-8 h-8 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Meeting Room Hub</h1>
              <p className="text-slate-300 text-sm">React 前端 + FastAPI 后端</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                用户名
              </label>
              <div className="relative">
                <UserCircle2 className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                <KeyRound className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 px-4 rounded-xl text-sm font-medium text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {busy ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="pt-5 border-t border-slate-100">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">演示账号</h2>
            <div className="grid gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword('123456');
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">{account.username}</div>
                    <div className="text-xs text-slate-500">{account.role}</div>
                  </div>
                  <div className="text-xs text-slate-400">密码：123456</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
