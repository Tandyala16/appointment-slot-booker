// src/components/DatePicker.jsx
import React from 'react';

const DatePicker = ({ selectedDate, onChange }) => {
  return (
    <div className="date-picker">
      <label>Select Date: </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default DatePicker; 