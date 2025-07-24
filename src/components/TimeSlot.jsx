// src/components/TimeSlot.jsx
import React from 'react';

const TimeSlot = ({ time, isBooked, onClick }) => {
  return (
    <button
      className={`time-slot ${isBooked ? 'booked' : ''}`}
      onClick={onClick}
      disabled={isBooked}
    >
      {time}
    </button>
  );
};

export default TimeSlot; 