import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { api } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?.userId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const targetUserId = userId || currentUser?.userId;
        
        if (!targetUserId) {
          throw new Error('User ID not found');
        }

        const response = await api.get(`/api/users/${targetUserId}`);
        setUser(response.data);

        const itemsResponse = await api.get(`/api/items/user/${targetUserId}`);
        setItems(itemsResponse.data);
      } catch (err) {
        setError(err.message);
        showToast('Error loading profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser, api, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>User not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {user.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isOwnProfile ? 'Your Items' : `${user.username}'s Items`}
        </h2>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {isOwnProfile ? 'You have not listed any items yet.' : 'This user has not listed any items yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/item/${item.itemId}`)}
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <div className="mt-2">
                  <span className="text-blue-600 font-medium">
                    Current Price: ${item.currentPrice}
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 