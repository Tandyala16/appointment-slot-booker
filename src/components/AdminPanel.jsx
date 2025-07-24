// src/components/AdminPanel.jsx
import React from 'react';

const AdminPanel = ({ bookings }) => {
  return (
    <div className="admin-panel">
      <h3>Admin Panel - Bookings</h3>
      {Object.entries(bookings).map(([date, slots]) => (
        <div key={date}>
          <strong>{date}:</strong> {slots.join(', ')}
        </div>
      ))}
    </div>
  );
};

export default AdminPanel; 