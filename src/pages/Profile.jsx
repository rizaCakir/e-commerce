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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: ""
  });
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [isAuthenticated, user, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:5260/api/User/${user.userId}`);
      setUserData(response.data);
      setEditedData({
        name: response.data.name,
        email: response.data.email,
        password: "",
        confirmPassword: "",
        studentId: response.data.studentId || ""
      });

      // Fetch user rating
      const ratingResponse = await axios.get(`http://localhost:5260/api/User/${user.userId}/rating`);
      setUserRating(ratingResponse.data);

      // Fetch virtual currency
      const currencyResponse = await axios.get(`http://localhost:5260/api/VirtualCurrency/${user.userId}`);
      setVirtualCurrency(currencyResponse.data);

      // Fetch favorites
      const favoritesResponse = await axios.get(`http://localhost:5260/api/Favourites/${user.userId}`);
      const favoritesData = favoritesResponse.data.$values || favoritesResponse.data;
      console.log('Favorites data:', favoritesData);
      setFavorites(favoritesData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Error loading profile data");
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

      await fetchUserData();
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
      await fetchUserData();
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Error removing item from favorites. Please try again.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://picsum.photos/400/300";
    return imagePath;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ⯨
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      name: userData.name,
      email: userData.email,
      password: "",
      confirmPassword: "",
      studentId: userData.studentId || ""
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!editedData.name?.trim()) {
        setError("Name is required.");
        return;
      }

      if (editedData.password && editedData.password !== editedData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const updateData = {
        userId: Number(user.userId),
        name: editedData.name.trim(),
        email: editedData.email.trim(),
        studentId: editedData.studentId || null,
      };

      if (editedData.password?.length > 0) {
        updateData.newPassword = editedData.password;
      }

      await axios.put(`http://localhost:5260/api/User/${user.userId}`, updateData);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      fetchUserData();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Error updating profile");
    }
  };
  
  

  const handleDelete = async () => {
    try {
      setError(null);
      await axios.delete(`http://localhost:5260/api/User/${user.userId}`);
      setSuccess("Account deleted successfully");
      logout();
      navigate("/");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Error deleting account");
      setShowDeleteConfirm(false);
    }
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
                  {userRating && (
                    <div className="flex">
                      {renderStars(userRating.averageRating)}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-x-4">
                {!isEditing && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete Account
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Confirm Account Deletion</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete your account? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input
                    type="text"
                    value={editedData.studentId}
                    onChange={(e) => setEditedData({ ...editedData, studentId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={editedData.password}
                      onChange={(e) => setEditedData({ ...editedData, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={editedData.confirmPassword}
                      onChange={(e) => setEditedData({ ...editedData, confirmPassword: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Name</h2>
                  <p className="mt-1 text-gray-600">{userData.name}</p>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Email</h2>
                  <p className="mt-1 text-gray-600">{userData.email}</p>
                </div>
                {userData.studentId && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Student ID</h2>
                    <p className="mt-1 text-gray-600">{userData.studentId}</p>
                  </div>
                )}
                {userRating && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Reputation</h2>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(userRating.averageRating)}
                      </div>
                      <span className="text-gray-600">
                        ({userRating.totalRatings} ratings)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

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
