import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SpaceBackground from '../components/SpaceBackground';

export default function ProfilePage() {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${username}`);
        
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError('Profile not found');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <SpaceBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <SpaceBackground />
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🌌</div>
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-8">
            The profile for <span className="text-blue-400 font-semibold">{username}.btc</span> doesn't exist in our cosmic database.
          </p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Claim This Domain
          </Link>
        </div>
      </div>
    );
  }

  const { user, sbts, socialLinks, wallets } = profileData;

  return (
    <div className="min-h-screen bg-black text-white">
      <SpaceBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || user.username}
                  className="w-32 h-32 rounded-full border-4 border-gradient-to-r from-blue-500 to-purple-500"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-white truncate">
                  {user.displayName || user.username}
                </h1>
                {user.isVerified && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <p className="text-blue-400 text-lg font-semibold mb-4">{user.domainName}</p>
              
              {user.bio && (
                <p className="text-gray-300 text-lg mb-4 leading-relaxed">{user.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{user.stats?.profileViews || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                Share Profile
              </button>
              <Link
                to={`/${username}/dashboard`}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallets & Social */}
          <div className="space-y-6">
            {/* Wallets */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Wallets
              </h2>
              <div className="space-y-3">
                {wallets && wallets.length > 0 ? (
                  wallets.map((wallet, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300 capitalize font-medium">{wallet.blockchain}</span>
                      <span className="text-blue-400 font-mono text-sm">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No wallets connected</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Social Links
              </h2>
              <div className="space-y-3">
                {socialLinks && socialLinks.length > 0 ? (
                  socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="text-gray-300 capitalize font-medium">{social.platform}</span>
                      <span className="text-blue-400 hover:text-blue-300">@{social.handle}</span>
                    </a>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No social links added</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - SBTs */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Proof of Work ({sbts?.length || 0} SBTs)
              </h2>
              
              {sbts && sbts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sbts.map((sbt, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                      {sbt.imageUrl && (
                        <img 
                          src={sbt.imageUrl}
                          alt={sbt.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{sbt.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sbt.category === 'achievement' ? 'bg-yellow-900 text-yellow-300' :
                          sbt.category === 'certification' ? 'bg-blue-900 text-blue-300' :
                          sbt.category === 'contribution' ? 'bg-green-900 text-green-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {sbt.category}
                        </span>
                      </div>
                      {sbt.description && (
                        <p className="text-gray-300 text-sm mb-3">{sbt.description}</p>
                      )}
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Issuer: {sbt.issuer.name || `${sbt.issuer.address.slice(0, 8)}...${sbt.issuer.address.slice(-8)}`}</p>
                        <p>Issued: {new Date(sbt.issuedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-gray-400 text-lg">No proof of work tokens yet</p>
                  <p className="text-gray-500 text-sm mt-2">SBTs will appear here once issued</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}