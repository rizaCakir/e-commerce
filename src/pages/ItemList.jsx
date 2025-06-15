import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [sortBy, setSortBy] = useState("time-asc");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    fetchItems();
  }, [sortBy, page, category, condition]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const isPriceSort = sortBy.startsWith("price");
      const url = isPriceSort
        ? "http://localhost:5260/api/Item/sorted-by-price"
        : "http://localhost:5260/api/Item/sorted-by-endtime";
  
      const params = {
        desc: sortBy.endsWith("desc"),
        page,
        pageSize,
        category: category !== "" ? getCategoryText(parseInt(category)) : "All",
        condition: condition !== "" ? getConditionText(parseInt(condition)) : "All"
      };
  
      const response = await axios.get(url, { params });
      const itemsData = Array.isArray(response.data)
        ? response.data
        : response.data.$values || [];
  
      console.log("Fetched items:", itemsData);
      setItems(itemsData);
    } catch (err) {
      console.error("Item fetch error:", err);
      setError("Error loading items. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const formatTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return "Time's up";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="time-asc">Time (Near to Far)</option>
            <option value="time-desc">Time (Far to Near)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            <option value="0">Electronics</option>
            <option value="1">Clothing</option>
            <option value="2">Books</option>
            <option value="3">Home</option>
            <option value="4">Sports</option>
            <option value="5">Other</option>
          </select>

          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">All Conditions</option>
            <option value="0">New</option>
            <option value="1">Like New</option>
            <option value="2">Good</option>
            <option value="3">Fair</option>
            <option value="4">Poor</option>
          </select>

          <button
            onClick={() => {
              setCategory("");
              setCondition("");
              setSortBy("time-asc");
              setPage(1);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            to={`/auction/${item.itemId}`}
            key={item.itemId}
            className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={item.image || "https://picsum.photos/400/300"}
                alt={item.title}
                className="object-cover w-full h-48"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-green-600 font-semibold">
                    Current Bid: {item.currentPrice}₺
                  </p>
                  <p className="text-red-600">
                    {formatTimeRemaining(item.endTime)}
                  </p>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Category: {getCategoryText(item.category)}</span>
                  <span>Condition: {getConditionText(item.condition)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-8">No items found</div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={items.length < pageSize}
          className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
