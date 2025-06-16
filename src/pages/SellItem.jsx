import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '1', // Default to 1 minute
    category: 0, // Default category (Other)
    condition: 0, // Default condition (New)
    startingPrice: '',
    buyoutPrice: '',
    image: '' // Changed from file to URL
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + parseFloat(formData.duration) * 60 * 1000); // Convert minutes to milliseconds
  
      const formDataToSend = new FormData();
      formDataToSend.append('UserId', user.userId);
      formDataToSend.append('Title', formData.title);
      formDataToSend.append('Description', formData.description);
      formDataToSend.append('Category', formData.category);
      formDataToSend.append('StartingPrice', formData.startingPrice);
      formDataToSend.append('CurrentPrice', formData.startingPrice);
      formDataToSend.append('BuyoutPrice', formData.buyoutPrice || 0);
      formDataToSend.append('StartTime', startTime.toISOString());
      formDataToSend.append('EndTime', endTime.toISOString());
      formDataToSend.append('Condition', formData.condition);
      formDataToSend.append('IsActive', true);
      formDataToSend.append('ImageUrl', formData.image);
  
      const response = await axios.post('http://localhost:5260/api/Item', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Item created:', response.data);
      navigate(`/auction/${response.data.itemId}`);
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Sell an Item</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter item title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your item"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>Electronics</option>
                <option value={1}>Clothing</option>
                <option value={2}>Books</option>
                <option value={3}>Home</option>
                <option value={4}>Sports</option>
                <option value={5}>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>New</option>
                <option value={1}>Like New</option>
                <option value={2}>Good</option>
                <option value={3}>Fair</option>
                <option value={4}>Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price (₺)
              </label>
              <input
                type="number"
                id="startingPrice"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="buyoutPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Buy Now Price (₺) 
              </label>
              <input
                type="number"
                id="buyoutPrice"
                name="buyoutPrice"
                value={formData.buyoutPrice}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Auction Duration
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1">1 min</option>
              <option value="3">3 min</option>
              <option value="10">10 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="360">6 hours</option>
              <option value="720">12 hours</option>
              <option value="1440">24 hours</option>
              <option value="2880">48 hours</option>
              <option value="4320">72 hours</option>
            </select>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the URL of your item's image
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Creating Item...' : 'Create Auction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellItem; 