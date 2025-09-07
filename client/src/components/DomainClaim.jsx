import { useState } from 'react';

export default function DomainClaim({ walletAddress, userSession }) {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');

  const handleClaimDomain = async (e) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      alert('Please enter a domain name');
      return;
    }

    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Claiming domain:', domain, 'for wallet:', walletAddress);
      
      // For now, we'll simulate the domain claim and save it to the backend
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: domain,
          walletAddress: walletAddress,
          displayName: domain,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Domain claimed successfully:', userData);
        alert(`🎉 Domain "${domain}.btc" claimed successfully!\n\nYou can now access your profile at:\n/${domain}/profile`);
        
        // Redirect to profile page
        setTimeout(() => {
          window.location.href = `/${domain}/profile`;
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim domain');
      }
      
    } catch (error) {
      console.error('Domain claim failed:', error);
      alert('Failed to claim domain: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Future: Smart contract integration will be added here

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleClaimDomain} className="space-y-6">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
            Claim Your .btc Domain
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="Enter domain name"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <span className="text-gray-300 font-medium">.btc</span>
          </div>
        </div>

        {walletAddress && (
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">
              <span className="font-medium">Connected Wallet:</span>
            </p>
            <p className="text-blue-400 font-mono text-sm break-all">
              {walletAddress}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !walletAddress || !domain.trim()}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            isLoading || !walletAddress || !domain.trim()
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Claiming Domain...</span>
            </div>
          ) : (
            `Claim ${domain || 'your'}.btc`
          )}
        </button>

        {!walletAddress && (
          <p className="text-center text-yellow-400 text-sm">
            ⚠️ Connect your wallet to claim a domain
          </p>
        )}

        {txId && (
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">
              <span className="font-medium">Transaction ID:</span>
            </p>
            <p className="text-green-300 font-mono text-sm break-all">
              {txId}
            </p>
          </div>
        )}
      </form>

      <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">How it works:</h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Connect your Leather wallet</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Choose your unique domain name</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Approve the transaction to claim your .btc domain</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Your domain gets linked to your wallet address</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">5.</span>
            <span>Access your profile at betterbns.com/yourdomain.btc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
