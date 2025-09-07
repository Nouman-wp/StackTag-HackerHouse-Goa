import { useState, useEffect } from 'react';
import { connect as stacksConnect, getLocalStorage, disconnect as stacksDisconnect } from '@stacks/connect';
import { detectLeatherWallet, waitForLeatherWallet, getLeatherWalletAddresses } from '../utils/walletDetection';
import { clearAllWalletData } from '../utils/walletStorage';

export default function LeatherWalletConnect({ onConnect, onDisconnect }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Try reading Stacks Connect cached storage first
    try {
      const data = getLocalStorage?.();
      const stxAddr = data?.addresses?.stx?.[0]?.address;
      if (stxAddr) {
        setWalletAddress(stxAddr);
        setIsConnected(true);
        localStorage.setItem('walletAddress', stxAddr);
        onConnect?.(stxAddr);
        return;
      }
    } catch {}

    // Fallback to our saved value
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setIsConnected(true);
      onConnect?.(savedAddress);
    }
  }, [onConnect]);

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      console.log('Starting wallet connection process...');
      
      // First, wait for Leather wallet to be available
      const detection = await waitForLeatherWallet(3000);
      console.log('Wallet detection result:', detection);

      if (!detection.available) {
        const installLeather = confirm(
          'Leather wallet not found. Would you like to install it?\n\n' +
          'Leather is required to connect your Stacks wallet and claim .btc domains.'
        );
        if (installLeather) {
          window.open('https://leather.io/', '_blank');
        }
        return;
      }

      // Preferred: Use Stacks Connect v8 connect with Leather only
      try {
        await stacksConnect({ approvedProviderIds: ['LeatherProvider'], forceWalletSelect: true });
        const data = getLocalStorage?.();
        const stxAddr = data?.addresses?.stx?.[0]?.address;
        if (stxAddr) {
          setWalletAddress(stxAddr);
          setIsConnected(true);
          localStorage.setItem('walletAddress', stxAddr);
          onConnect?.(stxAddr);
          return;
        }
      } catch (e) {
        console.log('Stacks connect fallback to direct provider. Reason:', e?.message || e);
      }

      // Fallback: Direct Leather provider APIs
      const result = await getLeatherWalletAddresses();
      if (result?.stacks) {
        setWalletAddress(result.stacks);
        setIsConnected(true);
        localStorage.setItem('walletAddress', result.stacks);
        onConnect?.(result.stacks);
        return;
      }
      throw new Error('Unable to get Stacks address from Leather');

    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      if (error.message.includes('User denied') || error.message.includes('cancelled')) {
        alert('Connection cancelled by user.');
      } else if (error.message.includes('not found') || error.message.includes('not available')) {
        const installLeather = confirm(
          'Leather wallet not found. Would you like to install it?\n\n' +
          'Leather is required to connect your Stacks wallet and claim .btc domains.'
        );
        if (installLeather) {
          window.open('https://leather.io/', '_blank');
        }
      } else {
        alert('Failed to connect wallet. Please make sure Leather wallet is installed, unlocked, and try again.\n\nError: ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    console.log('LeatherWalletConnect: Disconnecting...');
    try { stacksDisconnect?.(); } catch {}
    
    setIsConnected(false);
    setWalletAddress('');
    
    // Use the comprehensive storage clearing utility
    clearAllWalletData(true);
    
    onDisconnect?.();
    console.log('LeatherWalletConnect: Disconnected and storage cleared');
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
