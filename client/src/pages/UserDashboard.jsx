import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SpaceBackground from '../components/SpaceBackground';

export default function UserDashboard() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    github: '',
    farcaster: '',
    base: '',
    lens: '',
    instagram: ''
  });
  const [newSBT, setNewSBT] = useState({
    name: '',
    description: '',
    issuer: '',
    imageUrl: '',
    imageFile: null
  });
  const [sendSBT, setSendSBT] = useState({
    recipientAddress: '',
    recipientUsername: '',
    name: '',
    description: '',
    issuer: '',
    imageUrl: '',
    message: ''
  });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

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
        setSocialLinks({
          twitter: userData.user.socialLinks?.twitter || '',
          github: userData.user.socialLinks?.github || '',
          farcaster: userData.user.socialLinks?.farcaster || '',
          base: userData.user.socialLinks?.base || '',
          lens: userData.user.socialLinks?.lens || '',
          instagram: userData.user.socialLinks?.instagram || ''
        });
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

  const handleSocialLinksUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/users/${username}/social`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ socialLinks }),
      });

      if (response.ok) {
        alert('✅ Social links updated successfully!');
        fetchUserProfile(); // Refresh data
      } else {
        throw new Error('Failed to update social links');
      }
    } catch (err) {
      console.error('Social links update error:', err);
      alert('❌ Failed to update social links: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSBTImport = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('username', username);
      formData.append('name', newSBT.name);
      formData.append('description', newSBT.description);
      formData.append('issuer', newSBT.issuer);
      formData.append('imageUrl', newSBT.imageUrl);
      
      // Add image file if selected
      if (newSBT.imageFile) {
        formData.append('image', newSBT.imageFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/users/${username}/sbts`, {
        method: 'POST',
        body: formData, // Use FormData for file upload
      });

      if (response.ok) {
        const result = await response.json();
        alert(`🏆 SBT imported successfully!\n\n✅ SBT added to your profile\n🎯 View it at /${username}/profile`);
        setNewSBT({ name: '', description: '', issuer: '', imageUrl: '', imageFile: null });
        fetchUserProfile(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import SBT');
      }
    } catch (err) {
      console.error('SBT import error:', err);
      alert('❌ Failed to import SBT: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendSBT = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Validate recipient
      if (!sendSBT.recipientAddress && !sendSBT.recipientUsername) {
        throw new Error('Please provide either recipient wallet address or username');
      }

      const sbtData = {
        ...sendSBT,
        senderUsername: username,
        senderAddress: user.walletAddress
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/sbts/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sbtData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`🎉 SBT sent successfully to ${result.recipient}!\n\nThe token "${sendSBT.name}" is now visible on their profile.`);
        setSendSBT({
          recipientAddress: '',
          recipientUsername: '',
          name: '',
          description: '',
          issuer: '',
          imageUrl: '',
          message: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send SBT');
      }
    } catch (err) {
      console.error('SBT send error:', err);
      alert('❌ Failed to send SBT: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <SpaceBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dashboard...</p>
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
            <p className="text-gray-300 mb-6">Dashboard for "{username}.btc" could not be loaded.</p>
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

  const getSocialIcon = (platform) => {
    const icons = {
      twitter: '🐦',
      github: '🐙',
      farcaster: '🟣',
      base: '⚡',
      lens: '🌿',
      instagram: '📸'
    };
    return icons[platform] || '🔗';
  };

  const getSocialUrl = (platform, username) => {
    const baseUrls = {
      twitter: 'https://twitter.com/',
      github: 'https://github.com/',
      farcaster: 'https://warpcast.com/',
      base: 'https://base.org/name/',
      lens: 'https://hey.xyz/u/',
      instagram: 'https://instagram.com/'
    };
    return baseUrls[platform] + username;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">{username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                  <p className="text-blue-400 text-lg font-mono">{username}.btc</p>
                </div>
              </div>
              <Link
                to={`/${username}/profile`}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View Profile
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">🏆 SBTs</h3>
                <p className="text-2xl font-bold">{user.sbts?.length || 0}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">🔗 Social Links</h3>
                <p className="text-2xl font-bold">
                  {user.socialLinks ? Object.values(user.socialLinks).filter(link => link && link.trim()).length : 0}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">📅 Member Since</h3>
                <p className="text-lg font-bold">
                  {user.domainClaim?.claimedAt ? new Date(user.domainClaim.claimedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 mb-8">
            <div className="flex border-b border-gray-700">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'social', label: '🔗 Social Links', icon: '🔗' },
                { id: 'sbts', label: '🏆 Import SBTs', icon: '🏆' },
                { id: 'send', label: '📤 Send SBT', icon: '📤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">📊 Profile Overview</h2>
                  
                  {/* Current SBTs */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">🏆 Your SBTs ({user.sbts?.length || 0})</h3>
                    {user.sbts && user.sbts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.sbts.map((sbt, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                            {sbt.imageUrl && (
                              <img src={sbt.imageUrl} alt={sbt.name} className="w-full h-24 object-cover rounded-lg mb-3" />
                            )}
                            <h4 className="font-semibold text-white mb-1">{sbt.name}</h4>
                            <p className="text-gray-300 text-sm mb-2">{sbt.description}</p>
                            <p className="text-gray-400 text-xs">by {sbt.issuer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No SBTs yet. Import your first SBT to showcase your achievements!</p>
                      </div>
                    )}
                  </div>

                  {/* Current Social Links */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">🔗 Your Social Links</h3>
                    {user.socialLinks && Object.values(user.socialLinks).some(link => link && link.trim()) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(user.socialLinks).map(([platform, username]) => 
                          username && username.trim() ? (
                            <a
                              key={platform}
                              href={getSocialUrl(platform, username)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                              <span className="text-xl">{getSocialIcon(platform)}</span>
                              <div>
                                <p className="font-medium capitalize">{platform}</p>
                                <p className="text-sm text-gray-400">@{username}</p>
                              </div>
                            </a>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-800/30 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No social links added yet. Add your social profiles to connect with others!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links Tab */}
              {activeTab === 'social' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">🔗 Manage Social Links</h2>
                  <p className="text-gray-400 mb-6">Add your social media profiles to display on your public profile. These will show as clickable links with icons.</p>
                  
                  <form onSubmit={handleSocialLinksUpdate} className="space-y-4">
                    {Object.entries(socialLinks).map(([platform, value]) => (
                      <div key={platform} className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 w-32">
                          <span className="text-xl">{getSocialIcon(platform)}</span>
                          <label className="font-medium capitalize">{platform}</label>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setSocialLinks(prev => ({ ...prev, [platform]: e.target.value }))}
                            placeholder={`Your ${platform} username`}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="submit"
                      disabled={saving}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        saving
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Social Links'}
                    </button>
                  </form>
                </div>
              )}

              {/* SBTs Tab */}
              {activeTab === 'sbts' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">🏆 Import Soulbound Token</h2>
                  <p className="text-gray-400 mb-6">Import SBTs to showcase your achievements, certifications, and proof of work on your profile.</p>
                  
                  <form onSubmit={handleSBTImport} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SBT Name</label>
                      <input
                        type="text"
                        value={newSBT.name}
                        onChange={(e) => setNewSBT(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Web3 Developer Certificate"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={newSBT.description}
                        onChange={(e) => setNewSBT(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this achievement..."
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Issuer</label>
                      <input
                        type="text"
                        value={newSBT.issuer}
                        onChange={(e) => setNewSBT(prev => ({ ...prev, issuer: e.target.value }))}
                        placeholder="e.g., Stacks Foundation, ConsenSys Academy"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (optional)</label>
                      <input
                        type="url"
                        value={newSBT.imageUrl}
                        onChange={(e) => setNewSBT(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/sbt-image.png"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={newSBT.imageFile} // Disable URL input if file is selected
                      />
                    </div>

                    <div className="text-center text-gray-400 text-sm">
                      OR
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Upload Image File</label>
                      <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          newSBT.imageFile 
                            ? 'border-green-500 bg-green-900/20' 
                            : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                        }`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {newSBT.imageFile ? (
                              <>
                                <svg className="w-8 h-8 mb-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-green-400 font-medium">{newSBT.imageFile.name}</p>
                                <p className="text-xs text-gray-400">Click to change file</p>
                              </>
                            ) : (
                              <>
                                <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-400">
                                  <span className="font-medium">Click to upload</span> an image
                                </p>
                                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setNewSBT(prev => ({ 
                                  ...prev, 
                                  imageFile: file,
                                  imageUrl: '' // Clear URL when file is selected
                                }));
                              }
                            }}
                          />
                        </label>
                      </div>
                      {newSBT.imageFile && (
                        <button
                          type="button"
                          onClick={() => setNewSBT(prev => ({ ...prev, imageFile: null }))}
                          className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove file
                        </button>
                      )}
                    </div>

                    {(newSBT.imageUrl || newSBT.imageFile) && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                        <img 
                          src={newSBT.imageFile ? URL.createObjectURL(newSBT.imageFile) : newSBT.imageUrl} 
                          alt="SBT Preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={saving || !newSBT.name.trim() || !newSBT.description.trim() || !newSBT.issuer.trim()}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        saving || !newSBT.name.trim() || !newSBT.description.trim() || !newSBT.issuer.trim()
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {saving ? 'Importing SBT...' : 'Import SBT'}
                    </button>
                  </form>

                  <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <h3 className="font-semibold text-blue-400 mb-2">💡 SBT Import Tips:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• SBTs are non-transferable tokens that represent achievements</li>
                      <li>• Add certificates, course completions, hackathon wins, etc.</li>
                      <li>• Images should be publicly accessible URLs (IPFS, CDN, etc.)</li>
                      <li>• Once imported, SBTs will appear on your public profile</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Send SBT Tab */}
              {activeTab === 'send' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">📤 Send Soulbound Token</h2>
                  <p className="text-gray-400 mb-6">Issue and send SBTs directly to other users. The token will appear on their profile as proof of achievement or recognition.</p>
                  
                  <form onSubmit={handleSendSBT} className="space-y-6">
                    {/* Recipient Information */}
                    <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">👤 Recipient Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Recipient Username</label>
                          <input
                            type="text"
                            value={sendSBT.recipientUsername}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, recipientUsername: e.target.value }))}
                            placeholder="e.g., alice"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Username without .btc extension</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Or Wallet Address</label>
                          <input
                            type="text"
                            value={sendSBT.recipientAddress}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, recipientAddress: e.target.value }))}
                            placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Stacks wallet address</p>
                        </div>
                      </div>
                    </div>

                    {/* SBT Details */}
                    <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">🏆 SBT Details</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">SBT Name *</label>
                          <input
                            type="text"
                            value={sendSBT.name}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Outstanding Contributor Award"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                          <textarea
                            value={sendSBT.description}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the achievement or recognition..."
                            rows="3"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Issuer *</label>
                          <input
                            type="text"
                            value={sendSBT.issuer}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, issuer: e.target.value }))}
                            placeholder={`Issued by ${username}.btc`}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (optional)</label>
                          <input
                            type="url"
                            value={sendSBT.imageUrl}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="https://example.com/badge-image.png"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Personal Message (optional)</label>
                          <textarea
                            value={sendSBT.message}
                            onChange={(e) => setSendSBT(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Add a personal note to the recipient..."
                            rows="2"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {sendSBT.imageUrl && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                        <img 
                          src={sendSBT.imageUrl} 
                          alt="SBT Preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sending || !sendSBT.name.trim() || !sendSBT.description.trim() || !sendSBT.issuer.trim() || (!sendSBT.recipientAddress && !sendSBT.recipientUsername)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        sending || !sendSBT.name.trim() || !sendSBT.description.trim() || !sendSBT.issuer.trim() || (!sendSBT.recipientAddress && !sendSBT.recipientUsername)
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {sending ? 'Sending SBT...' : 'Send SBT to Recipient'}
                    </button>
                  </form>

                  <div className="mt-8 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
                    <h3 className="font-semibold text-purple-400 mb-2">📤 Sending SBTs:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• SBTs sent to others will appear instantly on their profile</li>
                      <li>• You can send to either a username.btc or wallet address</li>
                      <li>• Recipients don't need to accept - tokens appear automatically</li>
                      <li>• Use this to recognize achievements, contributions, or participation</li>
                      <li>• Include a personal message to add context to your recognition</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
