import { useState, useEffect } from 'react';
import { Connect } from '@stacks/connect-react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { clearAllWalletData } from '../utils/walletStorage';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export default function StacksWalletConnect({ onConnect, onDisconnect }) {
  const [userSession] = useState(new UserSession({ appConfig }));
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check if user is already signed in
      if (userSession.isSignInPending()) {
        const userData = await userSession.handlePendingSignIn();
        handleUserData(userData);
      } else if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        handleUserData(userData);
      } else {
        // Check localStorage for existing connection
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress) {
          setWalletAddress(savedAddress);
          setIsConnected(true);
          onConnect?.(savedAddress);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleUserData = (userData) => {
    const address = userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet;
    if (address) {
      setWalletAddress(address);
      setIsConnected(true);
      localStorage.setItem('walletAddress', address);
      onConnect?.(address);
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setShowWalletOptions(false);

    try {
      console.log('Connecting wallet with Stacks Connect...');
      
      const authOptions = {
        appDetails: {
          name: 'BetterBNS',
          icon: window.location.origin + '/vite.svg',
        },
        redirectTo: window.location.origin,
        onFinish: (data) => {
          console.log('Stacks Connect finished:', data);
          checkWalletConnection();
          setIsConnecting(false);
        },
        onCancel: () => {
          console.log('Stacks Connect cancelled');
          setIsConnecting(false);
        },
        userSession,
      };

      await showConnect(authOptions);

    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsConnecting(false);
      
      if (error.message.includes('User denied') || error.message.includes('cancelled')) {
        alert('Connection cancelled by user.');
      } else {
        alert('Failed to connect wallet. Please make sure you have a Stacks wallet installed and try again.\n\nError: ' + error.message);
      }
    }
  };

  const disconnect = () => {
    console.log('StacksWalletConnect: Disconnecting...');
    
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }
    
    setIsConnected(false);
    setWalletAddress('');
    clearAllWalletData();
    
    onDisconnect?.();
    console.log('StacksWalletConnect: Disconnected and storage cleared');
  };

  const getDisplayAddress = () => {
    if (!walletAddress) return 'Connect Wallet';
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowWalletOptions(!showWalletOptions)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">{getDisplayAddress()}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showWalletOptions && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-4">
              <p className="text-sm text-gray-300 mb-2">Connected to Stacks Testnet</p>
              <p className="text-xs text-gray-400 font-mono break-all">{walletAddress}</p>
            </div>
            <hr className="border-gray-700" />
            <button
              onClick={disconnect}
              className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: 'BetterBNS',
          icon: window.location.origin + '/vite.svg',
        },
        redirectTo: window.location.origin,
        onFinish: (data) => {
          console.log('Connect finished:', data);
          checkWalletConnection();
          setIsConnecting(false);
        },
        onCancel: () => {
          console.log('Connect cancelled');
          setIsConnecting(false);
        },
        userSession,
      }}
    >
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`${
          isConnecting 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
        } text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2`}
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>Connect Wallet</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </>
        )}
      </button>
    </Connect>
  );
}
