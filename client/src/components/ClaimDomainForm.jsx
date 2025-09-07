import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { stringAsciiCV, standardPrincipalCV } from '@stacks/transactions';
import { upsertProfile } from '../lib/api.js';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export default function ClaimDomainForm() {
  const [userSession] = useState(new UserSession({ appConfig }));
  const [userData, setUserData] = useState(null);
  const [domainName, setDomainName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, [userSession]);

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

    if (!userData) {
      setError('Please connect your wallet first');
      return;
    }

    const cleanDomain = domainName.toLowerCase().replace('.btc', '');
    const walletAddress = userData.profile?.stxAddress?.testnet;

    if (!walletAddress) {
      setError('Could not get wallet address');
      return;
    }

    try {
      setLoading(true);
      
      // Show contract call popup
      showContractCall({
        network: new StacksTestnet(),
        contractAddress: 'ST000000000000000000002AMW42H', // This should be your deployed contract address
        contractName: 'better-bns',
        functionName: 'claim',
        functionArgs: [
          stringAsciiCV(cleanDomain),
          standardPrincipalCV(walletAddress)
        ],
        onFinish: async (data) => {
          try {
            // Save profile to database after successful contract call
            await upsertProfile({
              bnsName: domainName.toLowerCase(),
              walletAddress,
              displayName: cleanDomain
            });
            
            setSuccess(`Successfully claimed ${domainName}!`);
            setTimeout(() => {
              window.location.href = `/${domainName.toLowerCase()}`;
            }, 2000);
          } catch (e) {
            console.error('Profile save error:', e);
            setError('Domain claimed on blockchain but failed to save profile');
          }
        },
        onCancel: () => {
          setLoading(false);
        },
      });
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
              disabled={loading || !userData}
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

          {!userData && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-200 text-center">
                Connect your Stacks wallet to claim a domain
              </p>
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