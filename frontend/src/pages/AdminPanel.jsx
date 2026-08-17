import React, { useState, useEffect } from 'react';
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
          
          return (
            <button
              key={dateStr}
              type="button"
              className={`calendar-day ${isSelected ? 'selected' : ''}`}
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

const getTodayDateString = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const AdminPanel = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalBookings: 0 });
  const [date, setDate] = useState(getTodayDateString());
  const [orderData, setOrderData] = useState(null);
  const [searchTableNo, setSearchTableNo] = useState('');
  const [billData, setBillData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats || { totalUsers: 0, totalOrders: 0, totalBookings: 0 });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load admin stats.');
      }
    };

    fetchAdminStats();
    fetchBookings();
    handleDateSelect(getTodayDateString());
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const handleDateSelect = async (selectedDate) => {
    setDate(selectedDate);
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/orders-by-date', { params: { date: selectedDate } });
      setOrderData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch orders for that date.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableBillSearch = async (e) => {
    e.preventDefault();
    if (!searchTableNo.trim()) {
      setError('Please enter a table number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/table-bill', { params: { tableNo: searchTableNo.trim() } });
      setBillData(res.data);
    } catch (err) {
      setBillData(null);
      setError(err.response?.data?.message || 'Table bill lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeTable = async (bookingId) => {
    try {
      const res = await api.delete(`/admin/booking/${bookingId}/free`);
      setMessage(res.data.message || 'Table freed successfully.');
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to free the table.');
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Admin Panel</h1>
        <p className="subtitle">Manage menu inventory, orders, and table status.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <section className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-header"><span>Total Users</span><span>👥</span></div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-header"><span>Total Orders</span><span>🧾</span></div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-header"><span>Total Bookings</span><span>📅</span></div>
          <div className="stat-value">{stats.totalBookings}</div>
        </div>
      </section>

      <div className="content-grid" style={{ marginTop: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Orders by Date</h2>
          <div style={{ marginBottom: '1.5rem', maxWidth: '340px' }}>
            <CalendarWidget 
              selectedDate={date} 
              onSelectDate={handleDateSelect} 
            />
          </div>

          {orderData && (
            <div>
              <p><strong>Date:</strong> {orderData.date}</p>
              <p><strong>Orders:</strong> {orderData.totalOrders}</p>
              <p><strong>Revenue:</strong> ₹{Number(orderData.totalRevenue || 0).toFixed(2)}</p>
              <ul>
                {orderData.orders?.map((order) => (
                  <li key={order._id} style={{ marginBottom: '0.75rem' }}>
                    <strong>User:</strong> {order.userId} <br />
                    <strong>Items:</strong> {order.items?.map((item) => `${item.name} x${item.quantity}`).join(', ') || 'No items'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Generate Bill by Table Number</h2>
          <form onSubmit={handleTableBillSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input type="number" min="1" max="25" style={{ flex: '1 1 180px' }} value={searchTableNo} onChange={(e) => setSearchTableNo(e.target.value)} placeholder="Enter table number (e.g. 5)" required />
            <button type="submit" className="btn btn-primary" disabled={loading}>Search</button>
          </form>

          {billData && (
            <div>
              <p><strong>Table:</strong> #{billData.tableNo}</p>
              <p><strong>Customer:</strong> {billData.user?.name}</p>
              <p><strong>Email:</strong> {billData.user?.email}</p>
              <p><strong>Total Bill:</strong> ₹{Number(billData.totalBill || 0).toFixed(2)}</p>
              <ul>
                {billData.orders?.map((order) => (
                  <li key={order._id} style={{ marginBottom: '0.75rem' }}>
                    <strong>Order:</strong> {new Date(order.createdAt).toLocaleString()} <br />
                    {order.items?.map((item) => `${item.name} x${item.quantity} = ₹${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}`).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Booked Tables</h2>
        {bookings.length === 0 ? (
          <p>No bookings available.</p>
        ) : (
          <div className="data-table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User ID</th>
                  <th>Table</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking._id}</td>
                    <td>{booking.userId}</td>
                    <td>{booking.tableNo}</td>
                    <td>{new Date(booking.bookingSlot).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleFreeTable(booking._id)}>Free Table</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
