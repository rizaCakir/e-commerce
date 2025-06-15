import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    console.log('AuctionDetail mounted with id:', id);
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    fetchItemDetails();
    fetchBids();
    checkFavoriteStatus();
  }, [id, user, navigate]);

  const fetchItemDetails = async () => {
    try {
      console.log('Fetching item details for id:', id);
      const response = await axios.get(`http://localhost:5260/api/Item/${id}`);
      console.log('Item details response:', response.data);
      setItem(response.data);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Error loading item details. Please try again.');
    }
  };

  const fetchBids = async () => {
    try {
      console.log('Fetching bids for item:', id);
      const response = await axios.get(`http://localhost:5260/api/Bid/${id}`);
      console.log('Bids response:', response.data);
      const bidsData = response.data.$values || [];
      setBids(bidsData);
    } catch (err) {
      console.error('Error fetching bids:', err);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      console.log('Checking favorite status for user:', user.userId);
      const response = await axios.get(`http://localhost:5260/api/Favourites/${user.userId}`);
      const favorites = response.data.$values || [];
      setIsFavorite(favorites.some(fav => fav.itemId === parseInt(id)));
    } catch (err) {
      console.error('Error checking favorite status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`http://localhost:5260/api/Bid`, {
        itemId: parseInt(id),
        userId: parseInt(user.userId),
        amount: parseFloat(bidAmount)
      });

      setBidAmount('');
      fetchItemDetails();
      fetchBids();
    } catch (err) {
      console.error('Error placing bid:', err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Error placing bid. Please try again.';
      setError(errorMessage);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
  
    try {
      await axios.post(`http://localhost:5260/api/Bid/buyout`, {
        itemId: parseInt(id),
        userId: parseInt(user.userId)
      });
  
      navigate('/');
    } catch (err) {
      console.error('Error buying item:', err);
      setError('Error processing purchase. Please try again.');
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5260/api/Favourites`, {
          params: {
            userId: user.userId,
            itemId: parseInt(id)
          }
        });
      } else {
        await axios.post(`http://localhost:5260/api/Favourites`, {
          userId: parseInt(user.userId),
          itemId: parseInt(id)
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Error updating favorites. Please try again.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://picsum.photos/400/300";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5260/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center text-gray-600 p-4">
        Item not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={getImageUrl(item?.image)}
              alt={item?.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full ${
                  isFavorite ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-6">{item.description}</p>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Current Price:</span>
                <span className="text-2xl font-bold text-green-600">
                  {item.currentPrice} ₺
                </span>
              </div>
              
              {item.buyoutPrice && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Buy Now Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {item.buyoutPrice} ₺
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">End Date:</span>
                <span className="text-lg">
                  {new Date(item.endTime).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleBid} className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Your Bid"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  min={item.currentPrice + 1}
                  step="0.01"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Place Bid
                </button>
              </div>
            </form>

            {item.buyoutPrice && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-6"
              >
                Buy Now
              </button>
            )}

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Bid History</h2>
              <div className="space-y-2">
                {bids.length > 0 ? (
                  bids.map((bid) => (
                    <div
                      key={bid.bidId}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-gray-600">
                        Bid by User #{bid.userId}
                      </span>
                      <span className="font-semibold text-green-600">
                        {bid.amount} ₺
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No bids yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail; 