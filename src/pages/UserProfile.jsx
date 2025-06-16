import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { userId } = useParams();
  const { api } = useApi();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user details from User API
        const userResponse = await api.get(`/api/User/${userId}`);
        console.log('User response:', JSON.stringify(userResponse.data, null, 2));
        setUser(userResponse.data);

        // Fetch user's items using the correct endpoint
        const itemsResponse = await api.get(`/api/Item/by-user/${userId}`);
        console.log('Items response:', JSON.stringify(itemsResponse.data, null, 2));
        const itemsData = Array.isArray(itemsResponse.data.$values) ? itemsResponse.data.$values : [];
        setItems(itemsData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        showToast('Error loading user profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, api, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{user.name}'s Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Student ID: {user.studentId}</p>
            <p className="text-gray-600">Average Rating: {user.averageRating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Items Sold</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">No items found</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Link
                key={item.itemId}
                to={`/auction/${item.itemId}`}
                className="block bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-600 font-medium">${item.currentPrice}</span>
                          <span className={`px-2 py-1 rounded text-sm ${
                            item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.isActive ? 'Active' : 'Ended'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.endTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 