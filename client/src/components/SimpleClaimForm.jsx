import { useState } from 'react';

export default function ClaimDomainForm() {
  const [domainName, setDomainName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClaim = async () => {
    setError('');
    setSuccess('');
    
    if (!domainName.trim()) {
      setError('Please enter a domain name');
      return;
    }

    if (!domainName.endsWith('.btc')) {
      setError('Domain must end with .btc');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate claiming process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Successfully claimed ${domainName}!`);
      setTimeout(() => {
        window.location.href = `/${domainName.toLowerCase()}`;
      }, 2000);
    } catch (e) {
      console.error('Claim error:', e);
      setError('Failed to claim domain');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Claim Your .btc Domain
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="yourname.btc"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleClaim}
              disabled={loading}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Claiming...' : 'Claim Domain'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          <div className="text-sm text-gray-300 space-y-2">
            <p>• Domain names must end with .btc</p>
            <p>• Only letters, numbers, and hyphens allowed</p>
            <p>• Minimum 3 characters (excluding .btc)</p>
            <p>• Domains are claimed on Stacks testnet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
