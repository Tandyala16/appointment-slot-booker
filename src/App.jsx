// src/App.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from './components/DatePicker.jsx';
import TimeSlotGrid from './components/TimeSlotGrid.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import './styles.css';

const BOOKINGS_KEY = 'slot_bookings';

const App = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState({});
  const [message, setMessage] = useState('');
  const [adminSlot, setAdminSlot] = useState('');

  // Load bookings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    if (saved) setBookings(JSON.parse(saved));
  }, []);

  // Save bookings to localStorage on change
  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const handleBookSlot = (time) => {
    setBookings((prev) => {
      const daySlots = prev[selectedDate] || [];
      if (daySlots.includes(time)) return prev; // Prevent double booking
      setMessage(`Appointment booked for ${time}!`);
      return {
        ...prev,
        [selectedDate]: [...daySlots, time],
      };
    });
  };

  const handleAdminPreBook = () => {
    if (!adminSlot.match(/^\d{2}:\d{2}$/)) {
      setMessage('Invalid slot time! Use format HH:MM (e.g., 14:00)');
      return;
    }
    setBookings((prev) => {
      const daySlots = prev[selectedDate] || [];
      if (daySlots.includes(adminSlot)) return prev; // Prevent double booking
      setMessage(`Slot ${adminSlot} marked as pre-booked!`);
      return {
        ...prev,
        [selectedDate]: [...daySlots, adminSlot],
      };
    });
    setAdminSlot('');
  };

  return (
    <div className="App">
      <h2>Interview Slot Booking</h2>
      <DatePicker selectedDate={selectedDate} onChange={d => { setSelectedDate(d); setMessage(''); }} />
      {selectedDate && (
        <>
          <TimeSlotGrid
            selectedDate={selectedDate}
            bookings={bookings}
            onBookSlot={handleBookSlot}
          />
          {message && <div style={{ color: 'green', margin: '16px 0' }}>{message}</div>}
          <hr />
          <div className="admin-panel">
            <h3>Admin Panel - Pre-book a Slot</h3>
            <input
              type="text"
              placeholder="e.g. 14:00"
              value={adminSlot}
              onChange={e => setAdminSlot(e.target.value)}
              style={{ marginRight: 8 }}
            />
            <button onClick={handleAdminPreBook}>Add Pre-booked</button>
          </div>
        </>
      )}
      <AdminPanel bookings={bookings} />
    </div>
  );
};

export default App; 