import React, { useState, useEffect } from 'react';
import { useLoaderData, useRevalidator, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/order/my-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Clear notifications
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setError(null);
    setMessage(null);
    try {
      const res = await api.patch(`/order/${id}/cancel`);
      setMessage(res.data.message || "Order successfully cancelled.");
      fetchOrders();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to cancel order.");
    }
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Order History & Kitchen Slips</h1>
        <p className="subtitle">Track all dishes ordered for your table and past dining bills.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!user ? (
        <div className="glass" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Sign In to View Your Orders
          </h2>
          <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '2rem' }}>
            To see your active food orders, itemized receipts, and order history, please sign in to your Gusto account.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              Sign In to Account
            </Link>
            <Link to="/menu" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem' }}>
              Browse Menu
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your active orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Orders Placed Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            You haven't ordered any food dishes yet. Make sure your table is booked, then browse our gourmet menu!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn btn-primary">
              🍕 Explore Menu & Order
            </Link>
            <Link to="/book-table" className="btn btn-secondary">
              📅 Book Table
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const orderTotal = calculateTotal(order.items);
            return (
              <div key={order._id} className="glass" style={{ padding: '1.75rem' }}>
                <div className="card-title-bar" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>🧾</span>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>ORDER SLIP</h3>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      ID: {order._id}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ordered At</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="data-table-container" style={{ marginBottom: '1.25rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Dish / Item Name</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>{item.name}</td>
                          <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ background: 'rgba(255, 107, 53, 0.15)', color: 'var(--accent-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                              {item.quantity}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Total Amount:</span>
                    <strong style={{ fontSize: '1.35rem', color: 'var(--accent-color)' }}>₹{orderTotal.toFixed(2)}</strong>
                  </div>
                  
                  <button onClick={() => handleCancelOrder(order._id)} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Cancel Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
