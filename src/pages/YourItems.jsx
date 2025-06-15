import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const YourItems = () => {
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
    fetchUserItems();
  }, [user, navigate]);

  const fetchUserItems = async () => {
    try {
      const response = await axios.get(`http://localhost:5260/api/Item/by-user/${user.userId}`);
      const itemsData = Array.isArray(response.data) ? response.data : response.data.$values || [];
      console.log('Fetched user items:', itemsData);
      setItems(itemsData);
    } catch (err) {
      console.error('Error fetching user items:', err);
      setError('Error loading your items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://picsum.photos/400/300";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5260/${imagePath}`;
  };

  const formatTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
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
            <h1>Your Listed Items</h1>
            <button
              onClick={() => navigate('/sell')}
              className="btn-gradient"
            >
              List New Item
            </button>
          </div>

          {items.length > 0 ? (
            <div className="grid-container">
              {items.map((item) => (
                <div key={item.itemId} className="card card-hover">
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
                          Current Price: {item.currentPrice}₺
                        </p>
                        <p className="text-sky-600">
                          {formatTimeRemaining(item.endTime)}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/auction/${item.itemId}`)}
                        className="btn-gradient w-full"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">You haven't listed any items yet.</p>
              <button
                onClick={() => navigate('/sell')}
                className="btn-gradient"
              >
                List Your First Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourItems; 