import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    bookingsCount: 0,
    ordersCount: 0,
    menuItemsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, ordersRes, menuRes] = await Promise.all([
          api.get('/booktable/my-bookings').catch(() => ({ data: { bookings: [] } })),
          api.get('/order/my-orders').catch(() => ({ data: { orders: [] } })),
          api.get('/menu').catch(() => ({ data: { menu: [] } })),
        ]);

        setStats({
          bookingsCount: bookingsRes.data?.bookings?.length || 0,
          ordersCount: ordersRes.data?.orders?.length || 0,
          menuItemsCount: menuRes.data?.menu?.length || 0,
        });
      } catch (err) {
        console.error("Error loading dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Welcome, {user?.name}!</h1>
        <p className="subtitle">Here is what's happening at Gusto today.</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Loading dashboard insights...
        </div>
      ) : (
        <>
          <section className="dashboard-grid">
            <div className="stat-card glass">
              <div className="stat-header">
                <span>Active Bookings</span>
                <span>📅</span>
              </div>
              <div className="stat-value">{stats.bookingsCount}</div>
              <div className="stat-footer">Your table reservations</div>
            </div>

            <div className="stat-card glass">
              <div className="stat-header">
                <span>Total Orders</span>
                <span>🛍️</span>
              </div>
              <div className="stat-value">{stats.ordersCount}</div>
              <div className="stat-footer">Gourmet meals requested</div>
            </div>

            <div className="stat-card glass">
              <div className="stat-header">
                <span>Dishes Available</span>
                <span>🍲</span>
              </div>
              <div className="stat-value">{stats.menuItemsCount}</div>
              <div className="stat-footer">Items in active menu</div>
            </div>
          </section>

          <section style={{ marginTop: '2.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Quick Actions</h2>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Link to="/book-table" className="stat-card glass" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪑</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--accent-color)' }}>Book a Table</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Find vacant tables and reserve your dining spot instantly.</p>
              </Link>

              <Link to="/menu" className="stat-card glass" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍕</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--accent-color)' }}>Order Food</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Browse the full gourmet menu and add meals to your tab.</p>
              </Link>

              <Link to="/orders" className="stat-card glass" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📜</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--accent-color)' }}>My Orders</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Review active order dishes and keep track of your dining history.</p>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
