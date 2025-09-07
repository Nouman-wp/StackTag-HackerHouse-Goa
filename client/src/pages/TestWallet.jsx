import { useState } from 'react';
import LeatherWalletConnect from '../components/LeatherWalletConnect';
import DomainClaim from '../components/DomainClaim';
import SpaceBackground from '../components/SpaceBackground';

export default function TestWallet() {
  const [walletAddress, setWalletAddress] = useState('');

  const handleWalletConnect = (address) => {
    console.log('Wallet connected:', address);
    setWalletAddress(address);
  };

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected');
    setWalletAddress('');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Wallet Connection Test
          </h1>
          <p className="text-gray-300">Test the wallet connection and domain claiming functionality</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Wallet Connection Section */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Step 1: Connect Your Wallet</h2>
            <div className="flex justify-center">
              <LeatherWalletConnect 
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
              />
            </div>
            
            {walletAddress && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 text-sm font-medium">✅ Wallet Connected!</p>
                <p className="text-green-300 font-mono text-sm break-all mt-1">{walletAddress}</p>
              </div>
            )}
          </div>

          {/* Domain Claiming Section */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Step 2: Claim Your Domain</h2>
            
            {walletAddress ? (
              <DomainClaim walletAddress={walletAddress} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">👆 Connect your wallet first to claim a domain</p>
                <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-900/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Instructions:</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Click "Connect Wallet" and choose your wallet from the dropdown</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Make sure you're on <strong>Stacks Testnet</strong> in your wallet</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Approve the connection in your wallet popup</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Once connected, enter a domain name and claim it</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-bold">5.</span>
                <span>Your domain will be linked to your wallet address</span>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-900/20 backdrop-blur-lg rounded-2xl p-4 border border-gray-700">
            <h4 className="text-sm font-semibold mb-2 text-gray-400">Debug Info:</h4>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Wallet Address: {walletAddress || 'Not connected'}</p>
              <p>LocalStorage: {localStorage.getItem('walletAddress') || 'Empty'}</p>
              <p>Timestamp: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
