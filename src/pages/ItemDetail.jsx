import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const getCategoryText = (category) => {
  const categories = {
    0: 'Electronics',
    1: 'Clothing',
    2: 'Books',
    3: 'Home',
    4: 'Sports',
    5: 'Other'
  };
  return categories[category] || 'Unknown';
};

const getConditionText = (condition) => {
  const conditions = {
    0: 'New',
    1: 'Like New',
    2: 'Good',
    3: 'Fair',
    4: 'Poor'
  };
  return conditions[condition] || 'Unknown';
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [transactionId, setTransactionId] = useState(null);
  const [sellerRating, setSellerRating] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchItemDetails();
    fetchTransactionId();
  }, [id, user, navigate]);

  const fetchItemDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5260/api/Item/${id}`);
      setItem(response.data);
      if (response.data.sellerId) {
        fetchSellerRating(response.data.sellerId);
      }
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Error loading item details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerRating = async (sellerId) => {
    try {
      const response = await axios.get(`http://localhost:5260/api/User/${sellerId}/rating`);
      setSellerRating(response.data);
    } catch (err) {
      console.error('Error fetching seller rating:', err);
    }
  };

  const fetchTransactionId = async () => {
    try {
      const response = await axios.get(`http://localhost:5260/api/Transaction/by-item-id/${id}`);
      if (response.data && response.data.transactionId) {
        setTransactionId(response.data.transactionId);
      }
    } catch (err) {
      console.error('Error fetching transaction:', err);
    }
  };

  const handleRatingSubmit = async () => {
    if (!rating) {
      setError('Please select a rating before submitting.');
      return;
    }

    if (!transactionId) {
      setError('Transaction information not found.');
      return;
    }

    try {
      await axios.post('http://localhost:5260/api/Transaction/rate', {
        transactionId: transactionId,
        rating: rating
      });
      setRatingSubmitted(true);
      setError('');
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.response?.data?.message || 'Error submitting rating. Please try again.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://picsum.photos/400/300";
    return imagePath;
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
          ({sellerRating?.ratingCount || 0} ratings)
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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={getImageUrl(item.image)}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            <p className="text-gray-600 mb-4">{item.description}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{getCategoryText(item.category)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium">{getConditionText(item.condition)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Final Price:</span>
                <span className="font-medium text-green-600">{item.currentPrice}₺</span>
              </div>

              {sellerRating && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Seller Rating:</span>
                    <div className="flex items-center">
                      {renderStars(sellerRating.averageRating)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!ratingSubmitted && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Rate this Transaction</h3>
                <div className="flex items-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRatingSubmit}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                  Submit Rating
                </button>
              </div>
            )}

            {ratingSubmitted && (
              <div className="mt-8 p-4 bg-green-100 text-green-700 rounded-md">
                Thank you for rating this transaction!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail; 