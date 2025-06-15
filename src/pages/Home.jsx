import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Ebeytepe Auctions</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your premier destination for online auctions. Browse through our extensive collection of items and start bidding today!
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/items"
            className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Browse Items
          </Link>
          {user && (
            <Link
              to="/profile"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              My Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 