import React, { useState, useEffect } from 'react';
import { useLoaderData, useRevalidator, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const slots = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  const getPeriod = (timeStr) => {
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const periods = ['Evening', 'Night'];

  return (
    <div className="time-schedule-widget">
      {periods.map(period => {
        const periodSlots = slots.filter(s => getPeriod(s) === period);
        if (periodSlots.length === 0) return null;
        return (
          <div key={period} className="period-section">
            <h4 className="period-title">{period} (Dinner Slots)</h4>
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
  const [isAm, setIsAm] = useState(false);
  const [mode, setMode] = useState('hour');
  const [tempHour, setTempHour] = useState(5);
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

  const R = 80;
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
  const [activeTab, setActiveTab] = useState('schedule');

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
  return totalMinutes >= 1020 && totalMinutes <= 1320;
};

const BookTable = () => {
  const initialBookings = useLoaderData() || [];
  const revalidator = useRevalidator();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, register, forgotPassword, resetPassword } = useAuth();
  
  const [userDate, setUserDate] = useState(() => {
    return searchParams.get('date') || '';
  });
  const [userTime, setUserTime] = useState(() => {
    return searchParams.get('time') || '';
  });

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
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Guest Authentication & Auto-Registration Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('register'); // 'register' | 'login' | 'forgot'
  
  // Registration fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password fields
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [authModalError, setAuthModalError] = useState('');
  const [authModalSuccess, setAuthModalSuccess] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const totalTables = 25;
  const tableNumbers = Array.from({ length: totalTables }, (_, i) => i + 1);

  // Auto-check availability if query parameters are present
  useEffect(() => {
    const pDate = searchParams.get('date');
    const pTime = searchParams.get('time');
    if (pDate && pTime) {
      setUserDate(pDate);
      setUserTime(pTime);
      checkAvailability(pDate, pTime);
    }
  }, [searchParams]);

  // Clear messages after a delay
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 6000);
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

  // Direct backend booking request
  const executeBooking = async (tableNo, date, time) => {
    try {
      const res = await api.post('/booktable/booking', {
        userTable: tableNo,
        userDate: date,
        userTime: time
      });

      setMessage(res.data.message || `Table #${tableNo} booked successfully!`);
      setBookingSuccessData({
        tableNo,
        date,
        time
      });

      setSelectedTable(null);
      setHasChecked(false);
      setShowAuthModal(false);
      revalidator.revalidate();
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || "Booking failed.";
      setError(errMsg);
      return false;
    }
  };

  // Called when user clicks "Reserve Table"
  const handleBookingClick = async (e) => {
    e.preventDefault();
    if (!selectedTable || !userDate || !userTime) {
      setError("Please check availability and select a vacant table first.");
      return;
    }

    if (!isValidBookingTime(userTime)) {
      setError("Table bookings are only allowed between 5:00 PM and 10:00 PM.");
      return;
    }

    // If user is already authenticated, book immediately!
    if (user) {
      await executeBooking(selectedTable, userDate, userTime);
    } else {
      // Open the auto-registration & authentication modal
      setAuthModalError('');
      setAuthModalSuccess('');
      setAuthTab('register');
      setShowAuthModal(true);
    }
  };

  // Modal: Handle Auto-Register & Book
  const handleAuthRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthModalError('');
    setAuthModalSuccess('');

    if (!guestName || !guestEmail || !guestPassword) {
      setAuthModalError('Please fill in all details.');
      return;
    }

    if (guestPassword.length < 6) {
      setAuthModalError('Password must be at least 6 characters long.');
      return;
    }

    setAuthSubmitting(true);
    try {
      // 1. Register and auto-authenticate user
      await register(guestName, guestEmail, guestPassword);
      setAuthModalSuccess('Account created! Finalizing your reservation...');
      
      // 2. Immediately execute table booking
      await executeBooking(selectedTable, userDate, userTime);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || '';
      const errCode = err.response?.data?.code || '';

      if (errCode === 'EMAIL_EXISTS' || errCode === 'USERNAME_EXISTS' || errMsg.toLowerCase().includes('already')) {
        setAuthModalError('An account with this email or username already exists. Please Sign In below to confirm your table, or reset your password.');
        setLoginEmail(guestEmail);
        setForgotEmail(guestEmail);
        setAuthTab('login');
      } else {
        setAuthModalError(errMsg || 'Registration failed. Please try again.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Modal: Handle Login & Book
  const handleAuthLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthModalError('');
    setAuthModalSuccess('');
    setAuthSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
      setAuthModalSuccess('Signed in successfully! Finalizing reservation...');
      await executeBooking(selectedTable, userDate, userTime);
    } catch (err) {
      console.error(err);
      setAuthModalError(err.response?.data?.message || 'Invalid username/email or password.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Modal: Handle Forgot Password Step 1
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setAuthModalError('');
    setAuthModalSuccess('');
    setAuthSubmitting(true);

    try {
      const res = await forgotPassword(forgotEmail);
      setForgotResetToken(res.resetToken);
      setAuthModalSuccess('Account verified. Please create your new password.');
      setForgotStep(2);
    } catch (err) {
      console.error(err);
      setAuthModalError(err.response?.data?.message || 'No account found with this email.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Modal: Handle Forgot Password Step 2 (Reset & Book)
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setAuthModalError('');
    setAuthModalSuccess('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthModalError('Passwords do not match.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setAuthModalError('Password must be at least 6 characters.');
      return;
    }

    setAuthSubmitting(true);
    try {
      await resetPassword(forgotEmail, forgotNewPassword, forgotResetToken);
      setAuthModalSuccess('Password updated & logged in! Finalizing reservation...');
      await executeBooking(selectedTable, userDate, userTime);
    } catch (err) {
      console.error(err);
      setAuthModalError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setAuthSubmitting(false);
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
        <p className="subtitle">Check real-time availability and secure your dining spot in seconds.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Booking Success Banner with Direct Order CTA */}
      {bookingSuccessData && (
        <div className="glass alert-success-card" style={{ marginBottom: '2rem', padding: '1.75rem', border: '1px solid rgba(46, 213, 115, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#2ed573', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                🎉 Reservation Confirmed!
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Your spot at <strong>Table #{bookingSuccessData.tableNo}</strong> is reserved for{' '}
                <strong>{bookingSuccessData.date}</strong> at <strong>{bookingSuccessData.time}</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/menu" className="btn btn-primary">
                🍕 Order Food for Table #{bookingSuccessData.tableNo} →
              </Link>
              <button className="btn btn-secondary" onClick={() => setBookingSuccessData(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="content-grid">
        {/* Reservation Form Section */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-color)' }}>
                  Check Table Availability
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Dinner: 5:00 PM – 10:00 PM
                </span>
              </div>
              
              <div className="booking-form-grid">
                <div className="form-group">
                  <label htmlFor="book-date" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
                    1. Choose Date
                  </label>
                  <CalendarWidget 
                    selectedDate={userDate}
                    onSelectDate={(date) => {
                      setUserDate(date);
                      checkAvailability(date, userTime);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="book-time" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
                    2. Choose Time Slot
                  </label>
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
                  ⏳ Checking vacant tables for {userDate} at {userTime}...
                </div>
              )}

              {!hasChecked && !checkingVacancy && (
                <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px', marginBottom: '2rem' }}>
                  Please select both a date and dinner time slot above to see available tables.
                </div>
              )}

              {hasChecked && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                      3. Select Your Table for {userDate} ({userTime})
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#2ed573', fontWeight: 600 }}>
                      {vacantTables.length} / 25 Tables Vacant
                    </span>
                  </div>

                  <div className="table-legend">
                    <div className="legend-item">
                      <div className="legend-dot vacant"></div>
                      <span>Vacant (Available)</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot reserved"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot my-selection"></div>
                      <span>Your Selection</span>
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
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 107, 53, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 107, 53, 0.3)', textAlign: 'center' }}>
                      <p style={{ marginBottom: '1rem', fontSize: '1.05rem' }}>
                        Selected: <strong style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>Table #{selectedTable}</strong> on <strong>{userDate}</strong> at <strong>{userTime}</strong>
                      </p>
                      <button onClick={handleBookingClick} className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', fontSize: '1rem', padding: '0.75rem' }}>
                        {user ? `Confirm Reservation for Table #${selectedTable}` : `Book Table #${selectedTable} (Auto-Register)`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* List of Active Reservations */}
        <div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>My Reservations</h2>
            
            {!user ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '1rem' }}>Sign in to view and manage your booked tables.</p>
                <Link to="/login" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Sign In to Account
                </Link>
              </div>
            ) : initialBookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active table reservations found.</p>
            ) : (
              <div className="list-items">
                {initialBookings.map((b) => (
                  <div key={b._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-color)' }}>Table #{b.tableNo}</span>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(46, 213, 115, 0.15)', color: '#2ed573', padding: '0.2rem 0.5rem', borderRadius: '5px' }}>
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

      {/* Guest Authentication & Auto-Registration Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🪑</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Complete Your Reservation</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Table #{selectedTable} • {userDate} at {userTime}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowAuthModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="modal-tabs">
              <button 
                type="button" 
                className={`modal-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthTab('register'); setAuthModalError(''); }}
              >
                New Guest (Register)
              </button>
              <button 
                type="button" 
                className={`modal-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setAuthModalError(''); }}
              >
                Sign In
              </button>
              {authTab === 'forgot' && (
                <button 
                  type="button" 
                  className="modal-tab-btn active"
                >
                  Forgot Password
                </button>
              )}
            </div>

            <div className="modal-body">
              {authModalError && <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>{authModalError}</div>}
              {authModalSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>{authModalSuccess}</div>}

              {/* Tab 1: New Guest Registration */}
              {authTab === 'register' && (
                <form onSubmit={handleAuthRegisterSubmit}>
                  <div className="form-group">
                    <label htmlFor="modal-name">Full Name</label>
                    <input
                      type="text"
                      id="modal-name"
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-email">Email Address</label>
                    <input
                      type="email"
                      id="modal-email"
                      placeholder="john@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-pwd">Password (for future logins)</label>
                    <input
                      type="password"
                      id="modal-pwd"
                      placeholder="Min 6 characters"
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '1rem' }}
                    disabled={authSubmitting}
                  >
                    {authSubmitting ? 'Registering & Reserving...' : `Register & Reserve Table #${selectedTable}`}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthTab('login'); setAuthModalError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Existing User Login */}
              {authTab === 'login' && (
                <form onSubmit={handleAuthLoginSubmit}>
                  <div className="form-group">
                    <label htmlFor="modal-login-email">Username or Email</label>
                    <input
                      type="text"
                      id="modal-login-email"
                      placeholder="your.email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-login-pwd">Password</label>
                    <input
                      type="password"
                      id="modal-login-pwd"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setAuthTab('forgot');
                        setForgotStep(1);
                        setAuthModalError('');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={authSubmitting}
                  >
                    {authSubmitting ? 'Signing In & Reserving...' : `Sign In & Reserve Table #${selectedTable}`}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    New to Gusto?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthTab('register'); setAuthModalError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Register as Guest
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Forgot Password Flow */}
              {authTab === 'forgot' && (
                <div>
                  {forgotStep === 1 ? (
                    <form onSubmit={handleForgotEmailSubmit}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1rem' }}>
                        Enter your registered email address to verify your account and set a new password:
                      </p>

                      <div className="form-group">
                        <label htmlFor="modal-forgot-email">Registered Email</label>
                        <input
                          type="email"
                          id="modal-forgot-email"
                          placeholder="your.email@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={authSubmitting}
                      >
                        {authSubmitting ? 'Verifying...' : 'Verify Email'}
                      </button>

                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        onClick={() => setAuthTab('login')}
                      >
                        Back to Sign In
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotResetSubmit}>
                      <div className="form-group">
                        <label htmlFor="modal-new-pwd">Create New Password</label>
                        <input
                          type="password"
                          id="modal-new-pwd"
                          placeholder="Min 6 characters"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="modal-confirm-pwd">Confirm New Password</label>
                        <input
                          type="password"
                          id="modal-confirm-pwd"
                          placeholder="Repeat new password"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          required
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={authSubmitting}
                      >
                        {authSubmitting ? 'Saving & Reserving...' : `Update Password & Reserve Table #${selectedTable}`}
                      </button>

                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        onClick={() => setForgotStep(1)}
                      >
                        Back
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTable;
