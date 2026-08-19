import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick reservation inputs
  const [quickDate, setQuickDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [quickTime, setQuickTime] = useState('19:00');

  useEffect(() => {
    const loadFeaturedMenu = async () => {
      try {
        const res = await api.get('/menu');
        const items = res.data.menu || [];
        setFeaturedDishes(items.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured menu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedMenu();
  }, []);

  const handleQuickBook = (e) => {
    e.preventDefault();
    navigate(`/book-table?date=${quickDate}&time=${quickTime}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section glass">
        <div className="hero-badge">
          <span className="live-pulse"></span>
          <span>Dinner Service Open • 5:00 PM – 10:00 PM Daily</span>
        </div>

        <h1 className="hero-title">
          Exquisite Flavors, <br />
          <span className="hero-gradient-text">Unforgettable Moments</span>
        </h1>

        <p className="hero-subtitle">
          Welcome to Gusto — where artisanal culinary artistry meets timeless elegance. 
          Indulge in hand-crafted gourmet dishes, crafted with the freshest seasonal ingredients.
        </p>

        <div className="hero-actions">
          <Link to="/book-table" className="btn btn-primary hero-btn">
            <span>📅</span> Reserve a Table
          </Link>
          <Link to="/menu" className="btn btn-secondary hero-btn">
            <span>🍕</span> Explore Menu
          </Link>
        </div>

        {/* Quick Table Check Widget */}
        <div className="quick-booking-card">
          <div className="quick-booking-header">
            <span className="quick-icon">✨</span>
            <div>
              <h3>Find Your Perfect Table</h3>
              <p>Check real-time table availability in seconds</p>
            </div>
          </div>

          <form onSubmit={handleQuickBook} className="quick-booking-form">
            <div className="quick-input-group">
              <label>Date</label>
              <input
                type="date"
                value={quickDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setQuickDate(e.target.value)}
                required
              />
            </div>

            <div className="quick-input-group">
              <label>Time Slot (5PM - 10PM)</label>
              <select 
                value={quickTime} 
                onChange={(e) => setQuickTime(e.target.value)}
              >
                <option value="17:00">5:00 PM - Evening Opening</option>
                <option value="18:00">6:00 PM - Early Dinner</option>
                <option value="19:00">7:00 PM - Prime Dining</option>
                <option value="20:00">8:00 PM - Prime Dining</option>
                <option value="21:00">9:00 PM - Late Dinner</option>
                <option value="22:00">10:00 PM - Last Seating</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary quick-submit-btn">
              Check Vacancy →
            </button>
          </form>
        </div>
      </section>

      {/* Why Dine With Us Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">THE GUSTO DIFFERENCE</span>
          <h2 className="section-title">A Symphony of Taste & Hospitality</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">🌿</div>
            <h3>Farm-Fresh Ingredients</h3>
            <p>Every vegetable, spice, and dairy product is hand-selected from certified organic growers daily.</p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">👨‍🍳</div>
            <h3>Master Craftsmanship</h3>
            <p>Our executive chefs blend traditional recipes with modern gastronomic techniques for perfection.</p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">🕯️</div>
            <h3>Intimate Atmosphere</h3>
            <p>Atmospheric lighting, serene acoustics, and elegant interiors create an idyllic dining ambience.</p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">📱</div>
            <h3>Seamless Table Service</h3>
            <p>Instant contactless table booking and real-time culinary ordering directly from your seat.</p>
          </div>
        </div>
      </section>

      {/* Signature Dishes Showcase */}
      <section className="signature-menu-section">
        <div className="section-header-flex">
          <div>
            <span className="section-tag">CHEF'S HIGHLIGHTS</span>
            <h2 className="section-title">Signature Creations</h2>
          </div>
          <Link to="/menu" className="btn btn-secondary">
            View Complete Menu →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">Curating today's gourmet selection...</div>
        ) : featuredDishes.length === 0 ? (
          <div className="glass empty-state-box">
            <p>Check out our full menu to view all dishes.</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Menu</Link>
          </div>
        ) : (
          <div className="menu-grid">
            {featuredDishes.map((dish) => (
              <div key={dish._id} className="menu-card glass">
                <span className="menu-card-tag">{dish.category || 'Special'}</span>
                <div>
                  <h3 className="menu-card-name">{dish.name}</h3>
                  <p className="menu-card-desc">{dish.description || 'Prepared fresh upon your table reservation.'}</p>
                </div>
                <div className="menu-card-footer">
                  <span className="menu-card-price">₹{dish.price?.toFixed(2)}</span>
                  <Link to="/menu" className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                    Order in Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Table Booking Callout Banner */}
      <section className="booking-banner glass">
        <div className="booking-banner-content">
          <h2>Ready for an Unforgettable Dinner?</h2>
          <p>
            Tables fill up quickly during prime evening hours. Book your favorite table online 
            and enjoy guaranteed seating with no waiting lines.
          </p>
          <div className="banner-buttons">
            <Link to="/book-table" className="btn btn-primary banner-btn">
              Reserve Your Table Now
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-secondary banner-btn">
                Customer Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer Info Section */}
      <footer className="home-footer">
        <div className="footer-columns">
          <div className="footer-col">
            <div className="brand-logo">🍽️ Gusto</div>
            <p>Elevating restaurant dining through fine cuisine, comfort, and seamless technology.</p>
          </div>

          <div className="footer-col">
            <h4>Hours & Service</h4>
            <p><strong>Monday – Sunday:</strong></p>
            <p>Evening: 5:00 PM – 10:00 PM</p>
            <p>Kitchen closes at 10:30 PM</p>
          </div>

          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <p><Link to="/menu">Explore Menu</Link></p>
            <p><Link to="/book-table">Book a Table</Link></p>
            {!user ? (
              <p><Link to="/login">Sign In / Register</Link></p>
            ) : (
              <p><Link to="/orders">My Orders</Link></p>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Gusto Restaurant Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
