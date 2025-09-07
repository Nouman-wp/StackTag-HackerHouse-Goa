import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export default function Header() {
  const [userSession] = useState(new UserSession({ appConfig }));
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, [userSession]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'BetterBNS',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setUserData(null);
    setShowDropdown(false);
  };

  const getDisplayName = () => {
    if (!userData) return null;
    const address = userData.profile?.stxAddress?.testnet;
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return 'Connected';
  };

  return (
    <header className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-orange-400 transition-colors">
              BetterBNS
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-orange-400 transition-colors">
              Home
            </Link>
            <Link to="/explore" className="text-white hover:text-orange-400 transition-colors">
              Explore
            </Link>
            {userData && (
              <Link to="/dashboard" className="text-white hover:text-orange-400 transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="relative">
            {userData ? (
              <div>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <span>{getDisplayName()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-white/10 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={disconnect}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
