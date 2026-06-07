import { useEffect, useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import {
  cancelBooking,
  createBooking,
  createRoom,
  deleteRoom,
  getAdminBookings,
  getCurrentRoomUsage,
  getCurrentUser,
  getMyBookings,
  getStatistics,
  listRooms,
  login,
  updateBookingStatus,
  updateRoom,
} from './lib/api';
import { clearSession, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './lib/auth';
import BookingPage from './pages/Booking';
import MyBookings from './pages/MyBookings';
import SearchRooms from './pages/SearchRooms';
import BookingManagement from './pages/admin/BookingManagement';
import RoomManagement from './pages/admin/RoomManagement';
import Statistics from './pages/admin/Statistics';
import { Booking, BookingPayload, BookingStatusUpdatePayload, Credentials, MeetingRoom, Role, RoomPayload, StatisticsBundle, User } from './types';

type View = 'search' | 'book' | 'my-bookings' | 'manage-rooms' | 'manage-bookings' | 'statistics';

const defaultViewForRole = (role: Role): View => (role === 'admin' ? 'statistics' : 'search');

export default function App() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser<User>());
  const [currentView, setCurrentView] = useState<View>(() =>
    getStoredUser<User>()?.role === 'admin' ? 'statistics' : 'search',
  );
  const [preselectedRoomId, setPreselectedRoomId] = useState<number | undefined>(undefined);
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [adminBookings, setAdminBookings] = useState<Booking[]>([]);
  const [statistics, setStatistics] = useState<StatisticsBundle | null>(null);
  const [appError, setAppError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setCurrentUser(user);
        setStoredUser(user);
        setCurrentView(defaultViewForRole(user.role));
        await refreshData(token, user);
      } catch {
        clearSession();
        setToken(null);
        setCurrentUser(null);
      } finally {
        setBootstrapping(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (!token || currentUser?.role !== 'admin' || currentView !== 'statistics') {
      return;
    }

    let active = true;

    const refreshCurrentRoomUsage = async () => {
      try {
        const latestUsage = await getCurrentRoomUsage(token);
        if (!active) return;
        setStatistics((current) =>
          current
            ? {
                ...current,
                currentRoomUsage: latestUsage,
              }
            : current,
        );
      } catch {
        // Keep the last successful snapshot if polling fails.
      }
    };

    refreshCurrentRoomUsage();
    const timer = window.setInterval(refreshCurrentRoomUsage, 30_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token, currentUser?.role, currentView]);

  async function refreshData(activeToken: string, user = currentUser) {
    if (!user) return;
    const roomsData = await listRooms(activeToken);
    const myBookingsData = await getMyBookings(activeToken);

    setRooms(roomsData);
    setMyBookings(myBookingsData);

    if (user.role === 'admin') {
      const [adminBookingsData, statsData] = await Promise.all([
        getAdminBookings(activeToken),
        getStatistics(activeToken),
      ]);
      setAdminBookings(adminBookingsData);
      setStatistics(statsData);
    } else {
      setAdminBookings([]);
      setStatistics(null);
    }
  }

  async function withBusy<T>(action: () => Promise<T>): Promise<T> {
    setBusy(true);
    setAppError('');
    try {
      return await action();
    } catch (error) {
      const resolvedError = error instanceof Error ? error : new Error('发生了未知错误');
      setAppError(resolvedError.message);
      throw resolvedError;
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(credentials: Credentials) {
    await withBusy(async () => {
      const result = await login(credentials);
      setStoredToken(result.access_token);
      setStoredUser(result.user);
      setToken(result.access_token);
      setCurrentUser(result.user);
      setCurrentView(defaultViewForRole(result.user.role));
      await refreshData(result.access_token, result.user);
    });
  }

  function handleLogout() {
    clearSession();
    setToken(null);
    setCurrentUser(null);
    setRooms([]);
    setMyBookings([]);
    setAdminBookings([]);
    setStatistics(null);
    setCurrentView('search');
    setAppError('');
  }

  function requireSession() {
    if (!token || !currentUser) {
      throw new Error('会话已过期，请重新登录。');
    }
    return { token, user: currentUser };
  }

  async function handleBookRoomSubmit(payload: BookingPayload) {
    await withBusy(async () => {
      const session = requireSession();
      await createBooking(session.token, payload);
      await refreshData(session.token, session.user);
      setCurrentView('my-bookings');
    });
  }

  async function handleCancelBooking(bookingId: number) {
    await withBusy(async () => {
      const session = requireSession();
      await cancelBooking(session.token, bookingId);
      await refreshData(session.token, session.user);
    });
  }

  async function handleCreateRoom(payload: RoomPayload) {
    await withBusy(async () => {
      const session = requireSession();
      await createRoom(session.token, payload);
      await refreshData(session.token, session.user);
    });
  }

  async function handleUpdateRoom(roomId: number, payload: Partial<RoomPayload>) {
    await withBusy(async () => {
      const session = requireSession();
      await updateRoom(session.token, roomId, payload);
      await refreshData(session.token, session.user);
    });
  }

  async function handleDeleteRoom(roomId: number) {
    await withBusy(async () => {
      const session = requireSession();
      await deleteRoom(session.token, roomId);
      await refreshData(session.token, session.user);
    });
  }

  async function handleUpdateBookingStatus(bookingId: number, payload: BookingStatusUpdatePayload) {
    await withBusy(async () => {
      const session = requireSession();
      await updateBookingStatus(session.token, bookingId, payload);
      await refreshData(session.token, session.user);
    });
  }

  const navigateToBooking = (roomId: number) => {
    setPreselectedRoomId(roomId);
    setCurrentView('book');
  };

  if (bootstrapping) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">正在加载工作区...</div>;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} busy={busy} error={appError} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return <SearchRooms rooms={rooms} onBookClick={navigateToBooking} />;
      case 'book':
        return (
          <BookingPage
            rooms={rooms}
            onBook={handleBookRoomSubmit}
            preselectedRoomId={preselectedRoomId}
            onCancel={() => setCurrentView('search')}
          />
        );
      case 'my-bookings':
        return <MyBookings bookings={myBookings} rooms={rooms} onCancel={handleCancelBooking} busy={busy} />;
      case 'manage-rooms':
        return (
          <RoomManagement
            rooms={rooms}
            onAddRoom={handleCreateRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            busy={busy}
          />
        );
      case 'manage-bookings':
        return (
          <BookingManagement
            bookings={adminBookings}
            rooms={rooms}
            onUpdateStatus={handleUpdateBookingStatus}
            busy={busy}
          />
        );
      case 'statistics':
        return <Statistics statistics={statistics} />;
      default:
        return <SearchRooms rooms={rooms} onBookClick={navigateToBooking} />;
    }
  };

  return (
    <Layout
      user={currentUser}
      onLogout={handleLogout}
      currentView={currentView}
      onNavigate={(view) => setCurrentView(view as View)}
      banner={appError}
      busy={busy}
    >
      {renderContent()}
    </Layout>
  );
}
