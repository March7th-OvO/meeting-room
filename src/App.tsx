import React, { useState } from 'react';
import { User, Booking, MeetingRoom } from './types';
import { mockUsers, mockRooms, mockBookings } from './data';
import Login from './components/Login';
import Layout from './components/Layout';

// Pages
import SearchRooms from './pages/SearchRooms';
import BookingPage from './pages/Booking';
import MyBookings from './pages/MyBookings';
import RoomManagement from './pages/admin/RoomManagement';
import BookingManagement from './pages/admin/BookingManagement';
import Statistics from './pages/admin/Statistics';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('search');
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);

  // Global State
  const [rooms, setRooms] = useState<MeetingRoom[]>(mockRooms);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('statistics');
    } else {
      setCurrentView('search');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('search');
  };

  const handleBookRoomSubmit = (newBooking: Omit<Booking, 'id' | 'status'>) => {
    const booking: Booking = {
      ...newBooking,
      id: `b${Date.now()}`,
      status: 'pending'
    };
    setBookings([booking, ...bookings]);
    setCurrentView('my-bookings');
  };

  const navigateToBooking = (roomId: string) => {
    setPreselectedRoomId(roomId);
    setCurrentView('book');
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return <SearchRooms rooms={rooms} onBookClick={navigateToBooking} />;
      case 'book':
        return (
          <BookingPage 
            rooms={rooms} 
            user={currentUser} 
            onBook={handleBookRoomSubmit}
            preselectedRoomId={preselectedRoomId}
            onCancel={() => setCurrentView('search')}
          />
        );
      case 'my-bookings':
        return <MyBookings bookings={bookings.filter(b => b.userId === currentUser.id)} rooms={rooms} />;
      case 'manage-rooms':
        return <RoomManagement rooms={rooms} onAddRoom={() => {}} onUpdateRoom={() => {}} onDeleteRoom={handleDeleteRoom} />;
      case 'manage-bookings':
        return <BookingManagement bookings={bookings} rooms={rooms} users={mockUsers} onUpdateStatus={handleUpdateBookingStatus} />;
      case 'statistics':
        return <Statistics bookings={bookings} rooms={rooms} />;
      default:
        return <SearchRooms rooms={rooms} onBookClick={navigateToBooking} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {renderContent()}
    </Layout>
  );
}
