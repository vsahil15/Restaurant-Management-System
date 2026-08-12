import React, { useState, useEffect } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import api from '../api/api';

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>New Date</label>
                    <input 
                      type="date" 
                      value={editDate} 
                      onChange={(e) => {
                        setEditDate(e.target.value);
                        checkAvailability(e.target.value, editTime, true);
                      }} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>New Time</label>
                    <input 
                      type="time" 
                      value={editTime} 
                      onChange={(e) => {
                        setEditTime(e.target.value);
                        checkAvailability(editDate, e.target.value, true);
                      }} 
                      required 
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
              
              <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="book-date">Choose Date</label>
                  <input 
                    type="date" 
                    id="book-date"
                    value={userDate} 
                    onChange={(e) => setUserDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="book-time">Choose Time</label>
                  <input 
                    type="time" 
                    id="book-time"
                    value={userTime} 
                    onChange={(e) => setUserTime(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ height: '46px' }} disabled={checkingVacancy}>
                  {checkingVacancy ? 'Checking...' : 'Check Availability'}
                </button>
              </form>

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
