import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [virtualCurrency, setVirtualCurrency] = useState(null);
  const [userData, setUserData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    fetchUserData(user.userId);
  }, [isAuthenticated, user, navigate]);

  const fetchUserData = async (userId) => {
    try {
      const [currencyResponse, userResponse, favoritesResponse, ratingResponse] = await Promise.all([
        axios.get(`http://localhost:5260/api/VirtualCurrency/${userId}`),
        axios.get(`http://localhost:5260/api/User/${userId}`),
        axios.get(`http://localhost:5260/api/Favourites/${userId}`),
        axios.get(`http://localhost:5260/api/User/${userId}/rating`)
      ]);

      setVirtualCurrency(currencyResponse.data);
      setUserData(userResponse.data);
      setUserRating(ratingResponse.data);
      
      // Handle favorites data
      const favoritesData = favoritesResponse.data.$values || favoritesResponse.data;
      console.log('Favorites data:', favoritesData);
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Error loading user information.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSetCurrency = async (e) => {
    e.preventDefault();
    if (!newBalance || isNaN(newBalance) || parseFloat(newBalance) < 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await axios.put(
        `http://localhost:5260/api/VirtualCurrency/${user.userId}`,
        { amount: parseFloat(newBalance) },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchUserData(user.userId);
      setNewBalance('');
    } catch (err) {
      console.error('Error setting currency:', err);
      setError('Error updating balance. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5260/api/Favourites`, {
        params: {
          userId: user.userId,
          itemId: itemId
        }
      });
      // Refresh favorites after deletion
      await fetchUserData(user.userId);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Error removing item from favorites. Please try again.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://picsum.photos/400/300";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5260/${imagePath}`;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({userRating?.ratingCount || 0} ratings)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{userData?.name}</h1>
                <p className="text-gray-600">{userData?.email}</p>
                <p className="text-gray-600">Student ID: {userData?.studentId}</p>
                <div className="mt-2">
                  <p className="text-gray-600 mb-1">Reputation:</p>
                  {userRating && renderStars(userRating.averageRating)}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="border-t pt-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Virtual Currency Balance</h2>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-2xl font-bold text-green-600">
                  {virtualCurrency?.amount ?? 0} ₺
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Set New Balance</h3>
                <form onSubmit={handleSetCurrency} className="space-y-2">
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="Enter new balance"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    min="0"
                    step="0.01"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Update Balance'}
                  </button>
                </form>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Favorite Items</h2>
              {favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.itemId}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={getImageUrl(favorite.image)}
                        alt={favorite.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{favorite.title}</h3>
                        <p className="text-green-600 font-bold mb-2">
                          {favorite.currentPrice} ₺
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => navigate(`/auction/${favorite.itemId}`)}
                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                          >
                            View Item
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(favorite.itemId)}
                            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                          >
                            Remove from Favorites
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No favorite items yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
