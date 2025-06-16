import React from 'react';
import { Link } from 'react-router-dom';

const ItemDetail = ({ item }) => {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
      <p className="text-gray-600 mb-4">{item.description}</p>
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-gray-500">Seller:</span>
        <Link
          to={`/profile/${item.userId}`}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          {item.user?.username || 'Unknown User'}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* ... existing code ... */}
      </div>
    </div>
  );
};

export default ItemDetail; 