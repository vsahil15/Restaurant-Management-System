import React, { useState, useEffect } from 'react';
import api from '../api/api';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [available, setAvailable] = useState(true);

  // CRUD state
  const [editingItem, setEditingItem] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load all menu items
  const fetchMenu = async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data.menu || []);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
      setError("Failed to load menu list.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Main Course');
    setAvailable(true);
    setEditingItem(null);
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setName(item.name || '');
    setDescription(item.description || '');
    setPrice(item.price || '');
    setCategory(item.category || 'Main Course');
    setAvailable(item.available !== undefined ? item.available : true);
    
    // Scroll smoothly to form container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}" from the menu?`)) {
      return;
    }

    try {
      await api.delete(`/menu/delete/${itemId}`);
      setMessage(`"${itemName}" deleted successfully!`);
      if (editingItem && editingItem._id === itemId) {
        resetForm();
      }
      fetchMenu();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to delete "${itemName}".`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const payload = {
      name,
      description,
      price: Number(price),
      category,
      available: Boolean(available),
    };

    try {
      if (editingItem) {
        // Edit Mode
        const res = await api.patch(`/menu/update/${editingItem._id}`, payload);
        setMessage(res.data.message || "Menu item updated successfully!");
        resetForm();
      } else {
        // Add Mode
        const res = await api.post('/menu/add', payload);
        setMessage(res.data.message || "Menu item added successfully!");
        resetForm();
      }
      fetchMenu();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save menu item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Menu Management</h1>
        <p className="subtitle">
          {editingItem ? 'Edit and modify culinary selection details.' : "Introduce a new gourmet dish or manage Gusto's dining selection."}
        </p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Form Container */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div className="card-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-color)', margin: 0 }}>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            {editingItem && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
          
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
                <label htmlFor="dish-price">Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  id="dish-price"
                  placeholder="E.g. 450.00" 
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
              {submitting ? 'Processing...' : (editingItem ? 'Save Changes' : 'Add Gourmet Dish')}
            </button>
          </form>
        </div>

        {/* List of current menu items */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Current Menu</h2>

          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading menu list...
            </div>
          ) : menuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No dishes found in the menu.
            </div>
          ) : (
            <div className="list-items" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {menuItems.map((item) => (
                <div key={item._id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem' }}>{item.name}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '5px', color: 'var(--text-muted)' }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description || 'No description.'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)', fontSize: '1rem' }}>₹{Number(item.price).toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleStartEdit(item)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item._id, item.name)} 
                        className="btn btn-danger" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
