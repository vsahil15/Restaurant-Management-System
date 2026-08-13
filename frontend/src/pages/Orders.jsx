import React, { useState, useEffect } from 'react';
import { useLoaderData, useRevalidator, Link } from 'react-router-dom';
import api from '../api/api';

const Orders = () => {
  const initialOrders = useLoaderData();
  const revalidator = useRevalidator();

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

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
      revalidator.revalidate();
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
        <h1>Order History</h1>
        <p className="subtitle">Keep track of your active requests and past culinary choices.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {initialOrders.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't ordered any food yet.</p>
          <Link to="/menu" className="btn btn-primary">Browse Menu & Order</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {initialOrders.map((order) => {
            const orderTotal = calculateTotal(order.items);
            return (
              <div key={order._id} className="glass" style={{ padding: '1.5rem' }}>
                <div className="card-title-bar" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>ORDER SLIP</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontFamily: 'monospace' }}>ID: {order._id}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed At</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="data-table-container" style={{ marginBottom: '1rem' }}>
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
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Grand Total:</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--accent-color)' }}>₹{orderTotal.toFixed(2)}</strong>
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
