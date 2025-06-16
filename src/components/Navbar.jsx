import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-green-600">
              eBeytepe
            </Link>
            <Link
              to="/items"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Browse
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  to="/your-items"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Your Items
                </Link>
                <Link
                  to="/bought-items"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Bought Items
                </Link>
                <Link
                  to="/sell"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  Sell Item
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
