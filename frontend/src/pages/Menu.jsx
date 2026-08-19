import React, { useState } from 'react';
import { useLoaderData, useRevalidator, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Menu = () => {
  const menuItems = useLoaderData();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quantities, setQuantities] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  // Extract unique categories, add 'All'
  const categories = ['All', ...new Set(menuItems.map(item => item.category || 'Other'))];

  const handleQuantityChange = (itemId, val) => {
    const q = Math.max(1, parseInt(val) || 1);
    setQuantities(prev => ({ ...prev, [itemId]: q }));
  };

  const handlePlaceOrder = async (item) => {
    const qty = quantities[item._id] || 1;
    setError(null);
    setMessage(null);

    // If user is not logged in, prompt table booking first
    if (!user) {
      setPendingItem(item);
      setShowBookingModal(true);
      return;
    }

    setSubmittingItem(item._id);

    try {
      const res = await api.post('/order/add', {
        itemName: item.name,
        itemPrice: item.price,
        quantity: qty
      });

      setMessage(`Success! Ordered ${qty}x ${item.name}.`);
      // Reset quantity to 1
      setQuantities(prev => ({ ...prev, [item._id]: 1 }));
      revalidator.revalidate();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to place order.";
      if (errMsg.toLowerCase().includes('book a table') || errMsg.toLowerCase().includes('booking') || err.response?.status === 403) {
        setPendingItem(item);
        setShowBookingModal(true);
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmittingItem(null);
    }
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => (item.category || 'Other') === activeCategory);

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Culinary Menu</h1>
        <p className="subtitle">Explore our hand-crafted selection of premium dishes.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && (
        <div className="alert alert-error">
          {error.includes("book a table") ? (
            <span>
              {error}{' '}
              <Link to="/book-table" style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}>
                Go book a table now
              </Link>
            </span>
          ) : (
            error
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="categories-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {menuItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No dishes are currently on the menu.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/admin/menu" className="btn btn-secondary">Add Menu Items</Link>
          </div>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => {
            const qty = quantities[item._id] || 1;
            const isSubmitting = submittingItem === item._id;

            return (
              <div key={item._id} className="menu-card glass">
                <span className="menu-card-tag">{item.category || 'Main'}</span>
                
                <div>
                  <h3 className="menu-card-name">{item.name}</h3>
                  <p className="menu-card-desc">{item.description || 'No description available.'}</p>
                </div>

                <div className="menu-card-footer">
                  <span className="menu-card-price">₹{item.price.toFixed(2)}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number"
                      min="1"
                      style={{ width: '50px', padding: '0.4rem', borderRadius: '6px', textAlign: 'center' }}
                      value={qty}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    />
                    <button
                      onClick={() => handlePlaceOrder(item)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '...' : 'Order'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Booking Prompt Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🪑</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Table Reservation Required</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>First book a table to place food orders</p>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowBookingModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {pendingItem ? (
                  <>
                    You're ordering <strong style={{ color: 'var(--accent-color)' }}>{pendingItem.name}</strong>. 
                    At Gusto, meals are prepared fresh and served straight to your reserved dining table.
                  </>
                ) : (
                  <>To place orders from our culinary menu, you must first have an active table reservation.</>
                )}
              </p>
              
              <div style={{ 
                background: 'rgba(255, 107, 53, 0.08)', 
                border: '1px solid rgba(255, 107, 53, 0.25)', 
                borderRadius: '10px', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--text-main)'
              }}>
                ✨ <strong>Easy 1-Minute Reservation:</strong> Check availability, select your favorite table, and reserve instantly!
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowBookingModal(false)}
                >
                  Back to Menu
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowBookingModal(false);
                    navigate('/book-table');
                  }}
                >
                  📅 Book Table Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
