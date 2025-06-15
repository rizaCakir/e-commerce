import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-secondary shadow-soft">
      <div className="content-container">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gradient">eBeytepe</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/items" className="nav-link">
                Browse Items
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                <Link to="/your-items" className="nav-link">
                  Your Items
                </Link>
                <Link to="/bought-items" className="nav-link">
                  Bought Items
                </Link>
                <Link to="/sell" className="btn-gradient">
                  Sell Item
                </Link>
                <button onClick={handleLogout} className="nav-link">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn-gradient">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sky-700 hover:text-sky-900 transition-medium"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-soft animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="nav-link block">
              Home
            </Link>
            <Link to="/items" className="nav-link block">
              Browse Items
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="nav-link block">
                  Profile
                </Link>
                <Link to="/your-items" className="nav-link block">
                  Your Items
                </Link>
                <Link to="/bought-items" className="nav-link block">
                  Bought Items
                </Link>
                <Link to="/sell" className="btn-gradient block text-center">
                  Sell Item
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link block w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link block">
                  Login
                </Link>
                <Link to="/register" className="btn-gradient block text-center">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
