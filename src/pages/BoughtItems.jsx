import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BoughtItems = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBoughtItems();
  }, [user, navigate]);

  const fetchBoughtItems = async () => {
    try {
      const response = await axios.get(`http://localhost:5260/api/Item/bought-by-user/${user.userId}`);
      const itemsData = Array.isArray(response.data) ? response.data : response.data.$values || [];
      console.log('Fetched bought items:', itemsData);
      setItems(itemsData);
    } catch (err) {
      console.error('Error fetching bought items:', err);
      setError('Error loading your purchased items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://picsum.photos/400/300";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5260/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="page-container flex justify-center items-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1>Your Purchased Items</h1>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  to={`/item/${item.itemId}`}
                  key={item.itemId}
                  className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    className="card-image"
                  />
                  <div className="card-content">
                    <h2 className="card-title">{item.title}</h2>
                    <p className="card-description">{item.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="card-price">
                          Purchase Price: {item.currentPrice}₺
                        </p>
                        <p className="text-sky-600">
                          Seller: {item.user?.name || 'Unknown'}
                        </p>
                      </div>
                      <button
                        className="btn-gradient w-full"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">You haven't purchased any items yet.</p>
              <button
                onClick={() => navigate('/items')}
                className="btn-gradient"
              >
                Browse Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoughtItems; 