import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPrint, FaTachometerAlt, FaPlus } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <FaPrint className="h-8 w-8 text-primary-600 mr-3" />
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
              Printer Monitor
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <FaTachometerAlt className="mr-2" />
              Dashboard
            </Link>
            
            <Link
              to="/printers"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/printers') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <FaPrint className="mr-2" />
              Printers
            </Link>
            
            <Link
              to="/add-printer"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/add-printer') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <FaPlus className="mr-2" />
              Add Printer
            </Link>
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-primary-600 focus:outline-none focus:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;