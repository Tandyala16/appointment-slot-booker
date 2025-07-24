// src/components/TimeSlotGrid.jsx
import React from 'react';
import TimeSlot from './TimeSlot.jsx';

function generateSlots(start = 9, end = 17) {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

const TimeSlotGrid = ({ selectedDate, bookings, onBookSlot }) => {
  const times = generateSlots();

  return (
    <div className="grid">
      {times.map((time) => {
        const isBooked = bookings[selectedDate]?.includes(time);
        return (
          <TimeSlot
            key={time}
            time={time}
            isBooked={isBooked}
            onClick={() => onBookSlot(time)}
          />
        );
      })}
    </div>
  );
};

export default TimeSlotGrid; 