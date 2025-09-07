import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SpaceBackground from '../components/SpaceBackground';

export default function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/users/${username}`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else if (response.status === 404) {
        setError('Profile not found');
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <SpaceBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <SpaceBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-400 mb-4">⚠️ {error}</h1>
            <p className="text-gray-300 mb-6">The profile "{username}.btc" could not be found.</p>
            <a 
              href="/" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">{username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.displayName || username}</h1>
                <p className="text-blue-400 text-lg font-mono">{username}.btc</p>
                <p className="text-gray-400 text-sm font-mono break-all">{user.walletAddress}</p>
              </div>
            </div>

            {user.profile?.bio && (
              <p className="text-gray-300 text-lg mb-6">{user.profile.bio}</p>
            )}

            {/* Domain Claim Info */}
            {user.domainClaim && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2">✅ Domain Claimed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Fee Paid:</span>
                    <span className="text-white ml-2">{user.domainClaim.fee}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Claimed:</span>
                    <span className="text-white ml-2">{new Date(user.domainClaim.claimedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Transaction:</span>
                    <span className="text-blue-400 ml-2 font-mono text-xs break-all">{user.domainClaim.txId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {user.socialLinks && Object.keys(user.socialLinks).some(key => user.socialLinks[key]) && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">🔗 Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.socialLinks.twitter && (
                  <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <span className="text-blue-400">🐦</span>
                    <span>Twitter: @{user.socialLinks.twitter}</span>
                  </a>
                )}
                {user.socialLinks.github && (
                  <a href={`https://github.com/${user.socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <span className="text-purple-400">🐙</span>
                    <span>GitHub: {user.socialLinks.github}</span>
                  </a>
                )}
                {user.socialLinks.farcaster && (
                  <a href={`https://warpcast.com/${user.socialLinks.farcaster}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <span className="text-green-400">🟣</span>
                    <span>Farcaster: {user.socialLinks.farcaster}</span>
                  </a>
                )}
                {user.socialLinks.base && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-blue-500">⚡</span>
                    <span>Base: {user.socialLinks.base}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SBTs */}
          {user.sbts && user.sbts.length > 0 && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
              <h2 className="text-2xl font-bold mb-6">🏆 Soulbound Tokens</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.sbts.map((sbt, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                    {sbt.imageUrl && (
                      <img src={sbt.imageUrl} alt={sbt.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                    )}
                    <h3 className="text-lg font-semibold text-white mb-2">{sbt.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{sbt.description}</p>
                    <div className="text-xs text-gray-400">
                      <p>Issued by: {sbt.issuer}</p>
                      <p>Date: {new Date(sbt.issuedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!user.sbts || user.sbts.length === 0) && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">🏆 Soulbound Tokens</h2>
              <p className="text-gray-400">No SBTs yet. Start building your reputation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
