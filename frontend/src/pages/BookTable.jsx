import React, { useState, useEffect } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import api from '../api/api';

// --- Custom Date picker: CalendarWidget ---
const CalendarWidget = ({ selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateString = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="custom-calendar-widget">
      <div className="calendar-header">
        <button type="button" onClick={handlePrevMonth}>&lt;</button>
        <span>{monthNames[month]} {year}</span>
        <button type="button" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar-weekdays">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>
      <div className="calendar-days">
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
          
          const dateStr = formatDateString(date);
          const isSelected = dateStr === selectedDate;
          const isPast = date < today;
          
          return (
            <button
              key={dateStr}
              type="button"
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
              disabled={isPast}
              onClick={() => onSelectDate(dateStr)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- 24-Hour Schedule Picker ---
const TimeScheduleWidget = ({ selectedTime, onSelectTime }) => {
  // Only allow hours 17, 18, 19, 20, 21, 22 (5:00 PM to 10:00 PM)
  const slots = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  const getPeriod = (timeStr) => {
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <div className="time-schedule-widget">
      {periods.map(period => {
        const periodSlots = slots.filter(s => getPeriod(s) === period);
        if (periodSlots.length === 0) return null;
        return (
          <div key={period} className="period-section">
            <h4 className="period-title">{period}</h4>
            <div className="schedule-grid">
              {periodSlots.map(slot => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectTime(slot)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Interactive Circular Clock Widget ---
const ClockWidget = ({ selectedTime, onSelectTime }) => {
  const [isAm, setIsAm] = useState(false); // Default to PM
  const [mode, setMode] = useState('hour'); // 'hour' or 'minute'
  const [tempHour, setTempHour] = useState(5); // Default to 5 PM
  const [tempMinute, setTempMinute] = useState(0);

  useEffect(() => {
    if (selectedTime) {
      const [hStr, mStr] = selectedTime.split(':');
      let h = parseInt(hStr || '17');
      const m = parseInt(mStr || '0');
      
      if (h >= 12) {
        setIsAm(false);
        if (h > 12) h -= 12;
      } else {
        setIsAm(true);
        if (h === 0) h = 12;
      }
      setTempHour(h);
      setTempMinute(m);
    } else {
      // Default to 5:00 PM
      setIsAm(false);
      setTempHour(5);
      setTempMinute(0);
    }
  }, [selectedTime]);

  const updateTime = (h, m, am) => {
    let finalHour = h;
    if (am) {
      if (finalHour === 12) finalHour = 0;
    } else {
      if (finalHour !== 12) finalHour += 12;
    }
    const finalTime = `${String(finalHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onSelectTime(finalTime);
  };

  const handleHourClick = (h) => {
    setTempHour(h);
    const updatedMin = h === 10 ? 0 : tempMinute;
    if (h === 10) setTempMinute(0);
    updateTime(h, updatedMin, isAm);
    setMode('minute');
  };

  const handleMinuteClick = (m) => {
    setTempMinute(m);
    updateTime(tempHour, m, isAm);
  };

  const toggleAmPm = (amVal) => {
    setIsAm(amVal);
    updateTime(tempHour, tempMinute, amVal);
  };

  const R = 80; // Radius
  const centerX = 110;
  const centerY = 110;

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const getPosition = (index, total) => {
    const angleDeg = (index * (360 / total)) - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = centerX + R * Math.cos(angleRad);
    const y = centerY + R * Math.sin(angleRad);
    return { left: `${x}px`, top: `${y}px` };
  };

  const getHandStyle = () => {
    let deg = 0;
    if (mode === 'hour') {
      const idx = hoursList.indexOf(tempHour);
      deg = idx * 30;
    } else {
      deg = (tempMinute / 60) * 360;
    }
    return {
      transform: `rotate(${deg}deg)`
    };
  };

  return (
    <div className="custom-clock-widget">
      <div className="clock-toggle-mode">
        <button
          type="button"
          className={`clock-mode-btn ${mode === 'hour' ? 'active' : ''}`}
          onClick={() => setMode('hour')}
        >
          {String(tempHour).padStart(2, '0')} h
        </button>
        <span className="clock-colon">:</span>
        <button
          type="button"
          className={`clock-mode-btn ${mode === 'minute' ? 'active' : ''}`}
          onClick={() => setMode('minute')}
        >
          {String(tempMinute).padStart(2, '0')} m
        </button>
        
        <div className="ampm-toggle">
          <button
            type="button"
            className={isAm ? 'active' : ''}
            onClick={() => toggleAmPm(true)}
            disabled={true}
          >
            AM
          </button>
          <button
            type="button"
            className={!isAm ? 'active' : ''}
            onClick={() => toggleAmPm(false)}
          >
            PM
          </button>
        </div>
      </div>

      <div className="clock-face-container">
        <div className="clock-center-dot"></div>
        <div className="clock-hand" style={getHandStyle()}></div>
        
        {mode === 'hour' ? (
          hoursList.map((h, idx) => {
            const pos = getPosition(idx, 12);
            const isSelected = tempHour === h;
            const isHourValid = !isAm && (h >= 5 && h <= 10);
            return (
              <button
                key={`hour-${h}`}
                type="button"
                className={`clock-number ${isSelected ? 'selected' : ''} ${!isHourValid ? 'disabled' : ''}`}
                style={{
                  ...pos,
                  opacity: isHourValid ? 1 : 0.3,
                  cursor: isHourValid ? 'pointer' : 'not-allowed'
                }}
                disabled={!isHourValid}
                onClick={() => handleHourClick(h)}
              >
                {h}
              </button>
            );
          })
        ) : (
          minutesList.map((m, idx) => {
            const pos = getPosition(idx, 12);
            const isSelected = tempMinute === m;
            const isMinuteValid = tempHour !== 10 || m === 0;
            return (
              <button
                key={`minute-${m}`}
                type="button"
                className={`clock-number ${isSelected ? 'selected' : ''} ${!isMinuteValid ? 'disabled' : ''}`}
                style={{
                  ...pos,
                  opacity: isMinuteValid ? 1 : 0.3,
                  cursor: isMinuteValid ? 'pointer' : 'not-allowed'
                }}
                disabled={!isMinuteValid}
                onClick={() => handleMinuteClick(m)}
              >
                {String(m).padStart(2, '0')}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Custom Time Picker Wrapper ---
const TimePickerWidget = ({ selectedTime, onSelectTime }) => {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'clock'

  return (
    <div className="custom-time-container">
      <div className="time-picker-tabs">
        <button
          type="button"
          className={`time-picker-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          24h Schedule
        </button>
        <button
          type="button"
          className={`time-picker-tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveTab('clock')}
        >
          Clock View
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <TimeScheduleWidget selectedTime={selectedTime} onSelectTime={onSelectTime} />
      ) : (
        <ClockWidget selectedTime={selectedTime} onSelectTime={onSelectTime} />
      )}
    </div>
  );
};

const isValidBookingTime = (timeStr) => {
  if (!timeStr) return false;
  const [hStr, mStr] = timeStr.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return false;
  
  const totalMinutes = hours * 60 + minutes;
  // 5:00 PM is 17:00 -> 1020 minutes
  // 10:00 PM is 22:00 -> 1320 minutes
  return totalMinutes >= 1020 && totalMinutes <= 1320;
};

const BookTable = () => {
  const initialBookings = useLoaderData();
  const revalidator = useRevalidator();
  
  const [userDate, setUserDate] = useState('');
  const [userTime, setUserTime] = useState('');
  const [vacantTables, setVacantTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [checkingVacancy, setCheckingVacancy] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // States for updating bookings
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTable, setEditTable] = useState(null);
  const [editVacantTables, setEditVacantTables] = useState([]);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Total tables in the restaurant
  const totalTables = 25;
  const tableNumbers = Array.from({ length: totalTables }, (_, i) => i + 1);

  // Clear messages after a delay
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const checkAvailability = async (date, time, isEditing = false) => {
    if (!date || !time) return;

    if (!isValidBookingTime(time)) {
      setError("Table bookings are only allowed between 5:00 PM and 10:00 PM.");
      if (isEditing) {
        setEditVacantTables([]);
      } else {
        setVacantTables([]);
        setSelectedTable(null);
        setHasChecked(false);
      }
      return;
    }
    
    if (isEditing) {
      try {
        const res = await api.get('/booktable/vacantTable', {
          params: { bookDate: date, bookTime: time }
        });
        setEditVacantTables(res.data.vacantTable || []);
      } catch (err) {
        console.error("Failed to check availability for edit:", err);
      }
    } else {
      setCheckingVacancy(true);
      setError(null);
      try {
        const res = await api.get('/booktable/vacantTable', {
          params: { bookDate: date, bookTime: time }
        });
        setVacantTables(res.data.vacantTable || []);
        setSelectedTable(null);
        setHasChecked(true);
      } catch (err) {
        setError("Could not check availability. Please verify inputs.");
        setHasChecked(false);
      } finally {
        setCheckingVacancy(false);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    checkAvailability(userDate, userTime);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTable || !userDate || !userTime) {
      setError("Please check availability and select a vacant table first.");
      return;
    }

    if (!isValidBookingTime(userTime)) {
      setError("Table bookings are only allowed between 5:00 PM and 10:00 PM.");
      return;
    }

    try {
      const res = await api.post('/booktable/booking', {
        userTable: selectedTable,
        userDate,
        userTime
      });
      setMessage(res.data.message || "Table booked successfully!");
      // Reset form and refresh loaders
      setSelectedTable(null);
      setHasChecked(false);
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed.");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await api.delete(`/booktable/cancel/booking/${id}`);
      setMessage(res.data.message || "Booking successfully cancelled!");
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed.");
    }
  };

  const startEdit = (booking) => {
    setEditingBooking(booking);
    
    // Parse combined slot format YYYY-MM-DDTHH:MM:00.000Z
    const slotStr = booking.bookingSlot;
    if (slotStr) {
      const datePart = slotStr.slice(0, 10);
      const timePart = slotStr.slice(11, 16);
      setEditDate(datePart);
      setEditTime(timePart);
      setEditTable(booking.tableNo);
      checkAvailability(datePart, timePart, true);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking || !editTable || !editDate || !editTime) return;

    if (!isValidBookingTime(editTime)) {
      setError("Table bookings are only allowed between 5:00 PM and 10:00 PM.");
      return;
    }

    try {
      const res = await api.patch(`/booktable/update/booking/${editingBooking._id}`, {
        userTable: editTable,
        userDate: editDate,
        userTime: editTime
      });
      setMessage(res.data.message || "Booking updated successfully!");
      setEditingBooking(null);
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || "Booking update failed.");
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Table Reservations</h1>
        <p className="subtitle">Secure your dining spot for a pristine culinary experience.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="content-grid">
        {/* Reservation Section */}
        <div>
          {editingBooking ? (
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div className="card-title-bar">
                <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-color)' }}>Modify Reservation</h2>
                <button className="btn btn-secondary" onClick={() => setEditingBooking(null)}>Cancel Edit</button>
              </div>

              <form onSubmit={handleUpdateBooking}>
                <div className="booking-form-grid">
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>New Date</label>
                    <CalendarWidget 
                      selectedDate={editDate} 
                      onSelectDate={(date) => {
                        setEditDate(date);
                        checkAvailability(date, editTime, true);
                      }} 
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>New Time</label>
                    <TimePickerWidget 
                      selectedTime={editTime} 
                      onSelectTime={(time) => {
                        setEditTime(time);
                        checkAvailability(editDate, time, true);
                      }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem' }}>Select Updated Table</label>
                  <div className="table-grid">
                    {tableNumbers.map(num => {
                      const isVacant = editVacantTables.includes(num) || num === editingBooking.tableNo;
                      const isSelected = editTable === num;
                      
                      return (
                        <div
                          key={num}
                          className={`restaurant-table ${isVacant ? 'available' : 'booked'} ${isSelected ? 'selected' : ''}`}
                          onClick={() => isVacant && setEditTable(num)}
                        >
                          T{num}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>New Reservation</h2>
              
              <div className="booking-form-grid">
                <div className="form-group">
                  <label htmlFor="book-date" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Choose Date</label>
                  <CalendarWidget 
                    selectedDate={userDate}
                    onSelectDate={(date) => {
                      setUserDate(date);
                      checkAvailability(date, userTime);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="book-time" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Choose Time</label>
                  <TimePickerWidget 
                    selectedTime={userTime}
                    onSelectTime={(time) => {
                      setUserTime(time);
                      checkAvailability(userDate, time);
                    }}
                  />
                </div>
              </div>

              {checkingVacancy && (
                <div style={{ textAlign: 'center', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 500 }}>
                  ⏳ Checking table vacancy...
                </div>
              )}

              {!hasChecked && !checkingVacancy && (
                <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px', marginBottom: '2rem' }}>
                  Please select both a date and time slot above to view vacant tables.
                </div>
              )}

              {hasChecked && (
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    Select a Table (Date: {userDate} at {userTime})
                  </h3>

                  <div className="table-legend">
                    <div className="legend-item">
                      <div className="legend-dot vacant"></div>
                      <span>Vacant</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot reserved"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot my-selection"></div>
                      <span>Your Choice</span>
                    </div>
                  </div>

                  <div className="table-grid">
                    {tableNumbers.map(num => {
                      const isVacant = vacantTables.includes(num);
                      const isSelected = selectedTable === num;
                      
                      return (
                        <div
                          key={num}
                          className={`restaurant-table ${isVacant ? 'available' : 'booked'} ${isSelected ? 'selected' : ''}`}
                          onClick={() => isVacant && setSelectedTable(num)}
                        >
                          T{num}
                        </div>
                      );
                    })}
                  </div>

                  {selectedTable && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                      <p style={{ marginBottom: '1rem', fontWeight: 500 }}>
                        You've selected <strong style={{ color: 'var(--accent-color)' }}>Table #{selectedTable}</strong>
                      </p>
                      <button onClick={handleBooking} className="btn btn-primary" style={{ width: '100%' }}>
                        Reserve Table #{selectedTable}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* List of active reservations */}
        <div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>My Reservations</h2>
            
            {initialBookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active table reservations found.</p>
            ) : (
              <div className="list-items">
                {initialBookings.map((b) => (
                  <div key={b._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-color)' }}>Table #{b.tableNo}</span>
                      <span style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '5px' }}>
                        Active
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
                      <strong>Slot:</strong> {new Date(b.bookingSlot).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => startEdit(b)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
                        Reschedule
                      </button>
                      <button onClick={() => handleCancelBooking(b._id)} className="btn btn-danger" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTable;
