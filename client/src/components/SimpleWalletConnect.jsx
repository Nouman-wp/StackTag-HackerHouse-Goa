import { useState, useEffect } from 'react';

export default function SimpleWalletConnect({ onConnect, onDisconnect }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if already connected
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setIsConnected(true);
      onConnect?.(savedAddress);
    }

    // Check if Leather wallet is available
    checkLeatherAvailability();
  }, [onConnect]);

  const checkLeatherAvailability = () => {
    if (typeof window !== 'undefined') {
      // Wait a bit for wallet extension to load
      setTimeout(() => {
        if (!window.LeatherProvider && !window.StacksProvider && !window.btc) {
          console.log('Leather wallet not detected');
        }
      }, 1000);
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      // Method 1: Try Leather's new btc API
      if (window.btc && window.btc.request) {
        try {
          console.log('Attempting to connect with btc API...');
          const addresses = await window.btc.request('getAddresses');
          console.log('BTC API addresses response:', addresses);
          
          if (addresses && addresses.result && addresses.result.addresses) {
            const stacksAddr = addresses.result.addresses.find(addr => addr.type === 'stacks');
            if (stacksAddr) {
              const address = stacksAddr.address;
              setWalletAddress(address);
              setIsConnected(true);
              localStorage.setItem('walletAddress', address);
              onConnect?.(address);
              console.log('Connected via BTC API:', address);
              return;
            }
          }
        } catch (error) {
          console.log('BTC API failed:', error.message);
        }
      }

      // Method 2: Try Leather's StacksProvider
      if (window.StacksProvider && window.StacksProvider.request) {
        try {
          console.log('Attempting to connect with StacksProvider...');
          const response = await window.StacksProvider.request('stx_getAccounts');
          console.log('StacksProvider response:', response);
          
          if (response.result && response.result.addresses && response.result.addresses.length > 0) {
            const address = response.result.addresses[0];
            setWalletAddress(address);
            setIsConnected(true);
            localStorage.setItem('walletAddress', address);
            onConnect?.(address);
            console.log('Connected via StacksProvider:', address);
            return;
          }
        } catch (error) {
          console.log('StacksProvider failed:', error.message);
          
          // If it's a user rejection, don't continue trying
          if (error.message && error.message.includes('User denied')) {
            throw new Error('User denied wallet connection');
          }
        }
      }

      // Method 3: Try older Leather API
      if (window.LeatherProvider && window.LeatherProvider.request) {
        try {
          console.log('Attempting to connect with LeatherProvider...');
          const response = await window.LeatherProvider.request('getAddresses');
          console.log('LeatherProvider response:', response);
          
          if (response && response.addresses && response.addresses.length > 0) {
            const stacksAddr = response.addresses.find(addr => addr.type === 'stacks');
            if (stacksAddr) {
              const address = stacksAddr.address;
              setWalletAddress(address);
              setIsConnected(true);
              localStorage.setItem('walletAddress', address);
              onConnect?.(address);
              console.log('Connected via LeatherProvider:', address);
              return;
            }
          }
        } catch (error) {
          console.log('LeatherProvider failed:', error.message);
        }
      }

      // If no wallet is found, show installation prompt
      throw new Error('Leather wallet not found or not accessible');
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      if (error.message.includes('User denied')) {
        alert('Connection cancelled by user.');
      } else if (error.message.includes('not found')) {
        const installLeather = confirm(
          'Leather wallet not found. Would you like to install it?\n\n' +
          'Leather is required to connect your Stacks wallet and claim .btc domains.'
        );
        if (installLeather) {
          window.open('https://leather.io/', '_blank');
        }
      } else {
        alert('Failed to connect wallet. Please make sure Leather wallet is installed, unlocked, and try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    localStorage.removeItem('walletAddress');
    onDisconnect?.();
  };

  const getDisplayAddress = () => {
    if (!walletAddress) return 'Connect Wallet';
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  };

  return (
    <div>
      {isConnected ? (
        <button
          onClick={disconnect}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm">{getDisplayAddress()}</span>
        </button>
      ) : (
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
            <span>Connect Leather</span>
          )}
        </button>
      )}
    </div>
  );
}