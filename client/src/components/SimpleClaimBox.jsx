import { useState } from 'react';

export default function SimpleClaimBox({ walletAddress }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setError('');
    if (!name.endsWith('.btc')) return setError('Enter a name ending with .btc');
    if (!walletAddress) return setError('Connect wallet first');
    
    try {
      setLoading(true);
      // Simulate claiming for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = `/${encodeURIComponent(name.toLowerCase())}`;
    } catch (e) {
      setError('Claim failed');
      setLoading(false);
    }
  };

  const inputStyle = {
    flex: '1',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    backgroundColor: '#ff6a00',
    color: 'black',
    fontWeight: '600',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading || !walletAddress ? '0.6' : '1'
  };

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="yourname.btc" 
          style={inputStyle}
        />
        <button 
          onClick={handleClaim} 
          disabled={loading || !walletAddress} 
          style={buttonStyle}
        >
          {loading ? 'Claiming...' : 'Claim'}
        </button>
      </div>
      {error && <div style={{ color: '#fca5a5', fontSize: '0.875rem' }}>{error}</div>}
      {!walletAddress && <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>Connect your wallet to claim a domain</div>}
    </div>
  );
}
