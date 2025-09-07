import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { clearAllWalletData } from '../utils/walletStorage';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export default function WalletSelector({ onConnect, onDisconnect }) {
  const [userSession] = useState(new UserSession({ appConfig }));
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    // Check if user is already signed in
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        const address = userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet;
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);
          localStorage.setItem('walletAddress', address);
          onConnect?.(address);
        }
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet;
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletAddress', address);
        onConnect?.(address);
      }
    } else {
      // Check localStorage for existing connection
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        setWalletAddress(savedAddress);
        setIsConnected(true);
        onConnect?.(savedAddress);
      }
    }

    // Check available wallets
    checkAvailableWallets();
  }, [userSession, onConnect]);

  const checkAvailableWallets = () => {
    const wallets = [];
    
    // Check for Leather wallet
    if (window.LeatherProvider || window.btc || window.StacksProvider) {
      wallets.push({
        id: 'leather',
        name: 'Leather',
        icon: '🔶',
        description: 'Leather Wallet - Bitcoin & Stacks',
        available: true,
        installUrl: 'https://leather.io/'
      });
    } else {
      wallets.push({
        id: 'leather',
        name: 'Leather',
        icon: '🔶',
        description: 'Leather Wallet - Bitcoin & Stacks',
        available: false,
        installUrl: 'https://leather.io/'
      });
    }

    // Check for Hiro Wallet (legacy)
    if (window.StacksProvider) {
      wallets.push({
        id: 'hiro',
        name: 'Hiro Wallet',
        icon: '🟠',
        description: 'Hiro Web Wallet',
        available: true,
        installUrl: 'https://wallet.hiro.so/'
      });
    }

    // Add Xverse (if available)
    if (window.XverseProviders?.StacksProvider) {
      wallets.push({
        id: 'xverse',
        name: 'Xverse',
        icon: '💜',
        description: 'Xverse Wallet',
        available: true,
        installUrl: 'https://xverse.app/'
      });
    } else {
      wallets.push({
        id: 'xverse',
        name: 'Xverse',
        icon: '💜',
        description: 'Xverse Wallet',
        available: false,
        installUrl: 'https://xverse.app/'
      });
    }

    setAvailableWallets(wallets);
  };

  const connectWallet = async (walletId = 'leather') => {
    if (isConnecting) return;
    setIsConnecting(true);
    setShowWalletOptions(false);

    try {
      console.log(`Connecting to ${walletId} wallet...`);
      
      // Use Stacks Connect for all wallets (it handles wallet selection)
      if (typeof showConnect === 'function') {
        console.log('Using Stacks Connect for wallet connection...');
        showConnect({
          appDetails: {
            name: 'BetterBNS',
            icon: window.location.origin + '/vite.svg',
          },
          redirectTo: '/',
          onFinish: (data) => {
            console.log('Stacks Connect finished, data:', data);
            // Handle the connection result
            if (userSession.isUserSignedIn()) {
              const userData = userSession.loadUserData();
              const address = userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet;
              if (address) {
                console.log('Connected with address:', address);
                setWalletAddress(address);
                setIsConnected(true);
                localStorage.setItem('walletAddress', address);
                onConnect?.(address);
              } else {
                console.error('No address found in user data:', userData);
              }
            }
            setIsConnecting(false);
          },
          onCancel: () => {
            console.log('Stacks Connect cancelled by user');
            setIsConnecting(false);
          },
          userSession,
        });
        return;
      }

      throw new Error('Stacks Connect is not available');

    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      if (error.message.includes('User denied') || error.message.includes('cancelled')) {
        alert('Connection cancelled by user.');
      } else if (error.message.includes('not found') || error.message.includes('not available')) {
        const wallet = availableWallets.find(w => w.id === walletId);
        const installWallet = confirm(
          `${wallet?.name || 'Wallet'} not found. Would you like to install it?\n\n` +
          `${wallet?.description || 'Required to connect your Stacks wallet and claim .btc domains.'}`
        );
        if (installWallet && wallet?.installUrl) {
          window.open(wallet.installUrl, '_blank');
        }
      } else {
        alert('Failed to connect wallet. Please make sure your wallet is installed, unlocked, and try again.\n\nError: ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    console.log('WalletSelector: Disconnecting...');
    
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }
    
    setIsConnected(false);
    setWalletAddress('');
    
    // Use the comprehensive storage clearing utility
    clearAllWalletData();
    
    onDisconnect?.();
    console.log('WalletSelector: Disconnected and storage cleared');
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
    <div className="relative">
      <button
        onClick={() => setShowWalletOptions(!showWalletOptions)}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showWalletOptions && !isConnecting && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-1">Connect Wallet</h3>
            <p className="text-sm text-gray-400">Choose your preferred wallet to connect to Stacks Testnet</p>
          </div>

          <div className="p-2">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => wallet.available ? connectWallet(wallet.id) : window.open(wallet.installUrl, '_blank')}
                className={`w-full p-4 rounded-lg mb-2 text-left transition-all duration-200 ${
                  wallet.available 
                    ? 'hover:bg-gray-800 border border-gray-700 hover:border-gray-600' 
                    : 'bg-gray-800/50 border border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <div className="text-white font-medium">{wallet.name}</div>
                      <div className="text-sm text-gray-400">{wallet.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {wallet.available ? (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Available</span>
                    ) : (
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">Install</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <p className="text-xs text-gray-400 text-center">
              Make sure you're connected to <span className="text-blue-400 font-medium">Stacks Testnet</span> in your wallet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
