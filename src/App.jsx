// src/App.jsx
import React, { useState, useEffect } from 'react';
import './styles.css';

// Utility: Generate all 30-min slots between 9:00 and 17:00 in 24h format
function generateSlots(start = 9, end = 17) {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

// Utility: Convert 24h time string (e.g., '14:30') to 12h format with AM/PM
function to12Hour(time) {
  const [h, m] = time.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${m} ${ampm}`;
}

const getToday = () => new Date().toISOString().slice(0, 10);
const BOOKINGS_KEY = 'slot_bookings';
const ATTENDED_KEY = 'slot_attended';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [bookings, setBookings] = useState({});
  const [attended, setAttended] = useState({});
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [showToastUI, setShowToastUI] = useState(false);
  const [adminSlot, setAdminSlot] = useState('');

  // Toast notification
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setShowToastUI(true);
    setTimeout(() => setShowToastUI(false), 2500);
  }

  // Request notification permission on mount
  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Load bookings and attended from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem(BOOKINGS_KEY);
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    const savedAttended = localStorage.getItem(ATTENDED_KEY);
    if (savedAttended) setAttended(JSON.parse(savedAttended));
  }, []);

  // Save bookings and attended to localStorage on change
  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem(ATTENDED_KEY, JSON.stringify(attended));
  }, [attended]);

  const slots = generateSlots();
  const bookedForDate = bookings[selectedDate] || [];
  const attendedForDate = attended[selectedDate] || [];

  function showNotification(slot) {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(`Appointment booked for ${slot}!`);
    }
  }

  function handleBookSlot(slot) {
    if (bookedForDate.includes(slot)) return;
    setBookings(prev => ({
      ...prev,
      [selectedDate]: [...bookedForDate, slot],
    }));
    showToast(`Appointment booked for ${slot}!`, 'success');
    showNotification(slot);
  }

  function handleAdminPreBook() {
    if (!slots.includes(adminSlot)) {
      showToast('Invalid slot time! Use format HH:MM (e.g., 14:00)', 'error');
      return;
    }
    if (bookedForDate.includes(adminSlot)) {
      showToast(`Slot ${adminSlot} is already booked!`, 'error');
      return;
    }
    setBookings(prev => ({
      ...prev,
      [selectedDate]: [...bookedForDate, adminSlot],
    }));
    showToast(`Slot ${adminSlot} marked as pre-booked!`, 'success');
    showNotification(adminSlot);
    setAdminSlot('');
  }

  function handleDateChange(e) {
    setSelectedDate(e.target.value);
    setToast('');
  }

  function markAsAttended(slot) {
    setBookings(prev => ({
      ...prev,
      [selectedDate]: bookedForDate.filter(s => s !== slot),
    }));
    setAttended(prev => ({
      ...prev,
      [selectedDate]: [...attendedForDate, slot],
    }));
    showToast(`Slot ${slot} marked as attended.`, 'info');
  }

  function unmarkAttended(slot) {
    setAttended(prev => ({
      ...prev,
      [selectedDate]: attendedForDate.filter(s => s !== slot),
    }));
    setBookings(prev => ({
      ...prev,
      [selectedDate]: [...bookedForDate, slot],
    }));
    showToast(`Slot ${slot} unmarked as attended.`, 'info');
  }

  // Utility to check if selected date is today or in the future
  function isDateTodayOrFuture(dateStr) {
    const today = new Date();
    const date = new Date(dateStr);
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    return date >= today;
  }

  const isBookable = isDateTodayOrFuture(selectedDate);

  return (
    <div className="App">
      {showToastUI && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✔️'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span>{toast.msg}</span>
          <button className="toast-close" onClick={() => setShowToastUI(false)} title="Close notification">×</button>
        </div>
      )}
      <header className="app-header">
        <h2 className="app-title">Appointment Slot Booker</h2>
        <div className="app-hours">
          Available from <span>9:00 AM</span> to <span>5:00 PM</span>
        </div>
        <div className="app-header-divider" />
      </header>

      <section className="date-picker">
        <h3 style={{ margin: 0, fontWeight: 600, color: '#1976d2', fontSize: '1.05rem' }}>Select Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          style={{ marginLeft: 12 }}
        />
      </section>

      <section style={{ marginTop: 18 }}>
        <h3 style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#1976d2', fontSize: '1.05rem' }}>Book a Time Slot</h3>
        {!isBookable && (
          <div style={{ color: '#e53935', fontWeight: 600, marginBottom: 12 }}>
            You cannot book slots for past dates.
          </div>
        )}
        <div className="grid">
          {slots.map((slot) => {
            const isBooked = bookedForDate.includes(slot);
            const isAttended = attendedForDate.includes(slot);
            let icon = '🟢';
            if (isAttended) icon = '🟣';
            else if (isBooked) icon = '⏳';
            return (
              <button
                key={slot}
                className={`time-slot${isBooked ? ' booked' : ''}${isAttended ? ' attended' : ''}`}
                disabled={isBooked || isAttended || !isBookable}
                onClick={() => handleBookSlot(slot)}
                style={{ minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                title={
                  !isBookable
                    ? 'Cannot book slots for past dates.'
                    : isAttended
                    ? 'This slot has already been attended.'
                    : isBooked
                    ? 'This slot is already booked.'
                    : 'Book this slot'
                }
              >
                <span style={{ fontSize: '1.1em' }}>{icon}</span>
                <span>{to12Hour(slot)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-panel">
        <h3>Admin Panel - Pre-book a Slot</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="e.g. 14:00"
            value={adminSlot}
            onChange={e => setAdminSlot(e.target.value)}
            style={{ minWidth: 120 }}
          />
          <button onClick={handleAdminPreBook}>Add Pre-booked</button>
        </div>
        <div style={{ marginTop: 18 }}>
          <h4 style={{ color: '#1976d2', fontWeight: 600, margin: '8px 0 4px 0' }}>Booked Slots for {selectedDate}:</h4>
          {bookedForDate.length === 0 && <div style={{ color: '#888' }}>No booked slots.</div>}
          {bookedForDate.map(slot => (
            <div key={slot} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ minWidth: 70, fontWeight: 500 }}>{slot}</span>
              <button style={{ marginLeft: 8 }} onClick={() => markAsAttended(slot)}>
                ✅ Mark as Attended
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <h4 style={{ color: '#1976d2', fontWeight: 600, margin: '8px 0 4px 0' }}>Attended Slots for {selectedDate}:</h4>
          {attendedForDate.length === 0 && <div style={{ color: '#888' }}>No attended slots.</div>}
          {attendedForDate.map(slot => (
            <div key={slot} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ minWidth: 70, fontWeight: 500 }}>{slot}</span>
              <button style={{ marginLeft: 8 }} onClick={() => unmarkAttended(slot)}>
                🔄 Unmark
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h4 style={{ color: '#1976d2', fontWeight: 600, margin: '8px 0 4px 0' }}>All Bookings (for test/debug):</h4>
        <div style={{ background: '#f8fafc', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: 14, marginTop: 8 }}>
          {Object.entries(bookings).length === 0 && <div style={{ color: '#888' }}>No bookings yet.</div>}
          {Object.entries(bookings).map(([date, slots]) => (
            <div key={date} style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: '#1976d2', fontSize: '1.01em', marginRight: 8 }}>
                📅 {date}:
              </span>
              {slots.length === 0 ? (
                <span style={{ color: '#aaa', fontStyle: 'italic' }}>No slots</span>
              ) : (
                slots.map((slot, idx) => (
                  <span
                    key={slot + idx}
                    style={{
                      display: 'inline-block',
                      background: 'var(--primary)',
                      color: '#fff',
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontSize: '0.98em',
                      fontWeight: 600,
                      marginRight: 6,
                      marginBottom: 2,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {to12Hour(slot)}
                  </span>
                ))
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 