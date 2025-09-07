import { useState } from 'react';
import { showContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { stringAsciiCV, standardPrincipalCV } from '@stacks/transactions';
import { upsertProfile } from '../lib/api.js';

export default function ClaimBox({ walletAddress }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setError('');
    if (!name.endsWith('.btc')) return setError('Enter a name ending with .btc');
    if (!walletAddress) return setError('Connect wallet first');
    
    try {
      setLoading(true);
      const network = new StacksTestnet();
      
      // Open Stacks Connect contract call popup
      showContractCall({
        network,
        contractAddress: 'ST000000000000000000002AMW42H', // placeholder
        contractName: 'better-bns',
        functionName: 'claim',
        functionArgs: [
          stringAsciiCV(name.toLowerCase().replace('.btc', '')),
          standardPrincipalCV(walletAddress)
        ],
        onFinish: async (data) => {
          try {
            // Save profile to database after successful contract call
            await upsertProfile({ 
              bnsName: name.toLowerCase(), 
              walletAddress,
              displayName: name.replace('.btc', '')
            });
            window.location.href = `/${encodeURIComponent(name.toLowerCase())}`;
          } catch (e) {
            setError('Profile save failed');
          }
        },
        onCancel: () => setLoading(false),
      });
    } catch (e) {
      setError('Claim failed');
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-3">
      <div className="flex gap-3">
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="yourname.btc" 
          className="flex-1 px-4 py-3 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none border border-white/20" 
        />
        <button 
          onClick={handleClaim} 
          disabled={loading || !walletAddress} 
          className="px-6 py-3 rounded bg-ember text-black font-semibold disabled:opacity-60 hover:bg-sunrise transition"
        >
          {loading ? 'Claiming...' : 'Claim'}
        </button>
      </div>
      {error && <div className="text-red-300 text-sm">{error}</div>}
      {!walletAddress && <div className="text-white/60 text-sm">Connect your wallet to claim a domain</div>}
    </div>
  );
}


