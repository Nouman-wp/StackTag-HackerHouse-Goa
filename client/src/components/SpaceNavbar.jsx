import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LeatherWalletConnect from './LeatherWalletConnect';
import { clearAllWalletData, debugWalletStorage } from '../utils/walletStorage';

export default function SpaceNavbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check localStorage for existing connection
    const savedAddress = localStorage.getItem('walletAddress');
    const savedUsername = localStorage.getItem('username');
    
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setIsConnected(true);
      if (savedUsername) {
        setUsername(savedUsername);
      } else {
        fetchUserProfile(savedAddress);
      }
    }
  }, []);

  const fetchUserProfile = async (address) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/users?walletAddress=${address}`);
      if (response.ok) {
        const user = await response.json();
        setUsername(user.username);
        localStorage.setItem('username', user.username);
      }
    } catch (error) {
      console.log('No existing profile found');
    }
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    setIsConnected(true);
    fetchUserProfile(address);
    // Note: Users are now created via domain claiming, not wallet connection
  };

  const handleWalletDisconnect = () => {
    console.log('Disconnecting wallet...');
    debugWalletStorage();
    
    setIsConnected(false);
    setWalletAddress('');
    setUsername('');
    setShowDropdown(false);
    
    // Clear all wallet-related data completely
    clearAllWalletData(true);
    
    console.log('Wallet disconnected and all storage cleared');
  };

  const getDisplayName = () => {
    if (username) return username + '.btc';
    if (walletAddress) return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    return 'Connect Wallet';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-white font-bold text-xl">Stack Tag</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/explore"
                className={`text-sm font-medium transition-colors ${
                  isActive('/explore') 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Explore
              </Link>
              {isConnected && username && (
                <Link
                  to={`/${username}/dashboard`}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.includes('/dashboard') 
                      ? 'text-blue-400' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Wallet Connection */}
            <div className="relative">
              {isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">{getDisplayName()}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="py-1">
                        {username ? (
                          <Link
                            to={`/${username}/profile`}
                            className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </Link>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Claim a domain to access profile
                          </div>
                        )}
                        
                        {username && (
                          <Link
                            to={`/${username}/dashboard`}
                            className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Dashboard
                          </Link>
                        )}
                        
                        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-700 mt-1">
                          {walletAddress && `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`}
                        </div>
                        
                        <hr className="border-gray-700 my-1" />
                        
                        {/* Debug option to force clear all data */}
                        <button
                          onClick={() => {
                            clearAllWalletData(true);
                            window.location.reload();
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-gray-800 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Force Clear Data
                        </button>
                        
                        <button
                          onClick={handleWalletDisconnect}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <LeatherWalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}