import React, { useState } from 'react';
import { useLoaderData, useRevalidator, Link } from 'react-router-dom';
import api from '../api/api';

const Menu = () => {
  const menuItems = useLoaderData();
  const revalidator = useRevalidator();
  
  const [quantities, setQuantities] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(null);

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
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to place order.");
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
                  <span className="menu-card-price">${item.price.toFixed(2)}</span>
                  
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
    </div>
  );
};

export default Menu;
