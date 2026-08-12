import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AdminMenu = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [available, setAvailable] = useState(true);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post('/menu/add', {
        name,
        description,
        price: Number(price),
        category,
        available: Boolean(available),
      });

      setMessage(res.data.message || "Menu item added successfully!");
      // Redirect to /menu after 1.5 seconds
      setTimeout(() => {
        navigate('/menu');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add menu item.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Add Menu Item</h1>
        <p className="subtitle">Introduce a new gourmet dish to Gusto's dining selection.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="glass" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dish-name">Dish Name</label>
            <input 
              type="text" 
              id="dish-name"
              placeholder="E.g. Filet Mignon" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="dish-desc">Description</label>
            <textarea 
              id="dish-desc"
              rows="3" 
              placeholder="E.g. Grilled premium tenderloin, served with rosemary butter and garlic mash."
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="dish-price">Price ($)</label>
              <input 
                type="number" 
                step="0.01" 
                id="dish-price"
                placeholder="E.g. 45.00" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="dish-category">Category</label>
              <select 
                id="dish-category"
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Specials">Specials</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
            <input 
              type="checkbox" 
              id="dish-avail"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={available} 
              onChange={(e) => setAvailable(e.target.checked)} 
            />
            <label htmlFor="dish-avail" style={{ cursor: 'pointer', textTransform: 'none', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
              Mark as available immediately
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
            {submitting ? 'Registering Dish...' : 'Add Gourmet Dish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminMenu;
