import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import { useToast } from '../context/ToastContext';

const YourItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { api } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/Item/${id}`);
        console.log('Item response:', JSON.stringify(response.data, null, 2));
        setItem(response.data);

        // Fetch seller details from User API
        if (response.data.userId) {
          try {
            const userResponse = await api.get(`/api/User/${response.data.userId}`);
            console.log('User response:', JSON.stringify(userResponse.data, null, 2));
            setItem(prev => ({
              ...prev,
              user: userResponse.data
            }));
          } catch (userErr) {
            console.error('Error fetching user:', userErr);
            showToast('Error loading seller information', 'error');
          }
        }

        const bidsResponse = await api.get(`/api/Bid/${id}`);
        console.log('Bids response:', JSON.stringify(bidsResponse.data, null, 2));
        const bidsData = Array.isArray(bidsResponse.data.$values) ? bidsResponse.data.$values : [];
        setBids(bidsData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        showToast('Error loading auction details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id, api, showToast]);

  useEffect(() => {
    if (item?.endTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(item.endTime).getTime();
        const distance = end - now;

        if (distance < 0) {
          setTimeLeft('Auction ended');
          clearInterval(timer);
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [item?.endTime]);

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

  if (!item) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>Item not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isAuctionEnded = new Date(item.endTime) < new Date();
  const isHighestBidder = bids.length > 0 && bids[bids.length - 1].userId === user?.userId;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-gray-500">Seller:</span>
              <Link
                to={`/profile/${item.userId}`}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {item.user?.name || 'Unknown User'}
              </Link>
            </div>

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

              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">End Date:</span>
                <span className="text-lg">
                  {new Date(item.endTime).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Time Left:</span>
                <span className="text-lg font-medium text-red-600">
                  {timeLeft}
                </span>
              </div>
            </div>

            {isAuctionEnded && (
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <p className="text-lg font-semibold text-gray-700">
                  {isHighestBidder
                    ? 'Congratulations! You won this auction!'
                    : 'This auction has ended'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Bid History</h3>
          {!Array.isArray(bids) || bids.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bids yet</p>
          ) : (
            <div className="space-y-2">
              {bids.map((bid) => (
                <div
                  key={bid.bidId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{bid.userName}</span>
                    <span className="text-gray-500 ml-2">
                      placed a bid of {bid.amount} ₺
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(bid.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourItemDetail; 