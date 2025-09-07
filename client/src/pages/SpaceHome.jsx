import { useState, useEffect } from 'react';
import SpaceBackground from '../components/SpaceBackground';
import DomainClaim from '../components/DomainClaim';

export default function SpaceHome() {
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    // Check for connected wallet
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const handleClaimDomain = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and hyphens');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check wallet connection
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        setError('Please connect your Leather wallet first');
        setIsLoading(false);
        return;
      }

      // Check if username is available
      const response = await fetch(`/api/users/${username.toLowerCase()}`);
      if (response.ok) {
        setError('Username is already taken');
        setIsLoading(false);
        return;
      }

      // Create user profile
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.toLowerCase(),
          walletAddress,
          displayName: username
        }),
      });

      if (createResponse.ok) {
        localStorage.setItem('username', username.toLowerCase());
        window.location.href = `/${username.toLowerCase()}/profile`;
      } else {
        const errorData = await createResponse.json();
        setError(errorData.error || 'Failed to claim domain');
      }
    } catch (error) {
      console.error('Claim domain error:', error);
      setError('Failed to claim domain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SpaceBackground />
      
      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl mx-auto px-4">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Own Your Digital
            <br />
            <span className="text-white">Identity</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Claim your unique <span className="text-blue-400 font-semibold">.btc</span> domain on Stacks blockchain 
            and showcase your verifiable proof-of-work in the digital cosmos
          </p>

          {/* Claim Form */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Claim Your <span className="text-blue-400">.btc</span> Domain
            </h2>
            
            <DomainClaim walletAddress={walletAddress} />

            <div className="text-sm text-gray-400 space-y-1">
              <p>• Connect your Leather wallet to claim a domain</p>
              <p>• Username must be 3+ characters (letters, numbers, hyphens only)</p>
              <p>• Each wallet can claim one domain</p>
              <p>• Domains are secured on Stacks testnet</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Secured</h3>
              <p className="text-gray-400">
                Your identity is secured on Stacks blockchain, ensuring true ownership and decentralization.
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Proof of Work</h3>
              <p className="text-gray-400">
                Display verifiable SBT tokens as proof of your contributions and achievements.
              </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Built with modern technology for instant loading and seamless user experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-20 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">1,000+</div>
              <div className="text-gray-400">Domains Claimed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">2,500+</div>
              <div className="text-gray-400">SBTs Issued</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
