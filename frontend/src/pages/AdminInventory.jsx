import React, { useState, useEffect } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import api from '../api/api';

const AdminInventory = () => {
  const inventoryItems = useLoaderData();
  const revalidator = useRevalidator();

  // Add Item State
  const [itemName, setItemName] = useState('');
  const [itemCurrentStock, setItemCurrentStock] = useState('');
  const [stockUnit, setStockUnit] = useState('kg');
  const [costPerUnit, setCostPerUnit] = useState('');

  // Refill State
  const [refillItem, setRefillItem] = useState(null);
  const [addQuantity, setAddQuantity] = useState('');
  const [materialunit, setMaterialunit] = useState('kg');
  const [perPrice, setPerPrice] = useState('');
  const [rawMaterialName, setRawMaterialName] = useState('');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post('/admin/inventory/add', {
        itemName,
        itemCurrentStock: Number(itemCurrentStock),
        stockUnit,
        costPerUnit: Number(costPerUnit)
      });
      
      setMessage(res.data.message || "Ingredient added successfully!");
      // Reset form
      setItemName('');
      setItemCurrentStock('');
      setCostPerUnit('');
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add ingredient.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRefill = (item) => {
    setRefillItem(item);
    setRawMaterialName(item.itemName);
    setAddQuantity('');
    setMaterialunit(item.stockUnit);
    setPerPrice(item.costPerUnit);
  };

  const handleRefillIngredient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.patch(`/admin/inventory/restock/${refillItem._id}`, {
        rawMaterialName,
        addQuantity: Number(addQuantity),
        materialunit,
        perPrice: Number(perPrice)
      });

      setMessage(res.data.message || "Material successfully refilled.");
      setRefillItem(null);
      revalidator.revalidate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to refill ingredient.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Inventory Control</h1>
        <p className="subtitle">Monitor raw material stock levels and record replenishments.</p>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="content-grid">
        {/* Left Side: Table of stock */}
        <div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Current Stock Levels</h2>
            
            {inventoryItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No inventory records found.</p>
            ) : (
              <div className="data-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th style={{ textAlign: 'right' }}>Stock Level</th>
                      <th style={{ textAlign: 'right' }}>Cost / Unit</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ 
                            color: item.itemCurrentStock < 10 ? '#ef4444' : 'var(--text-main)', 
                            fontWeight: item.itemCurrentStock < 10 ? 'bold' : 'normal' 
                          }}>
                            {item.itemCurrentStock} {item.stockUnit}
                          </span>
                          {item.itemCurrentStock < 10 && (
                            <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '0.5rem', textTransform: 'uppercase' }}>
                              (Low)
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>₹{item.costPerUnit.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => handleStartRefill(item)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            Refill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Forms */}
        <div>
          {refillItem ? (
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div className="card-title-bar">
                <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-color)' }}>Refill Stock</h2>
                <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setRefillItem(null)}>
                  Cancel
                </button>
              </div>

              <form onSubmit={handleRefillIngredient}>
                <div className="form-group">
                  <label>Material Name</label>
                  <input 
                    type="text" 
                    value={rawMaterialName} 
                    onChange={(e) => setRawMaterialName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Add Quantity</label>
                  <input 
                    type="number" 
                    placeholder="E.g. 5"
                    value={addQuantity} 
                    onChange={(e) => setAddQuantity(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Measurement Unit</label>
                  <select value={materialunit} onChange={(e) => setMaterialunit(e.target.value)} required>
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="li">li (Liter)</option>
                    <option value="pcs">pcs (Pieces)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cost Per Unit (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="E.g. 2.50"
                    value={perPrice} 
                    onChange={(e) => setPerPrice(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                  {submitting ? 'Updating...' : 'Confirm Replenishment'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Add New Ingredient</h2>
              
              <form onSubmit={handleAddIngredient}>
                <div className="form-group">
                  <label htmlFor="ing-name">Ingredient Name</label>
                  <input 
                    type="text" 
                    id="ing-name"
                    placeholder="E.g. Olive Oil" 
                    value={itemName} 
                    onChange={(e) => setItemName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ing-stock">Current Stock Level</label>
                  <input 
                    type="number" 
                    id="ing-stock"
                    placeholder="E.g. 10" 
                    value={itemCurrentStock} 
                    onChange={(e) => setItemCurrentStock(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ing-unit">Unit of Measure</label>
                  <select id="ing-unit" value={stockUnit} onChange={(e) => setStockUnit(e.target.value)} required>
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="li">li (Liter)</option>
                    <option value="pcs">pcs (Pieces)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ing-cost">Cost Per Unit (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    id="ing-cost"
                    placeholder="E.g. 15.00" 
                    value={costPerUnit} 
                    onChange={(e) => setCostPerUnit(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Ingredient'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
