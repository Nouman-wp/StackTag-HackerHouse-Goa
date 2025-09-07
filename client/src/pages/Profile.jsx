import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProfilePage() {
  const { name } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/profile/${name}`);
      if (res.ok) setProfile(await res.json());
    };
    fetchProfile();
  }, [name]);

  if (!profile) {
    return <div className="min-h-screen bg-bbns-gradient text-white p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-bbns-gradient text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20" />
            <div>
              <h2 className="text-2xl font-semibold">{profile.displayName || profile.bnsName}</h2>
              <p className="text-white/70">{profile.walletAddress}</p>
            </div>
          </div>
          <p className="mt-4 text-white/80">{profile.bio}</p>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded">
              <h3 className="font-semibold mb-2">Wallets</h3>
              <ul className="text-white/80 text-sm">
                {Object.entries(profile.wallets || {}).map(([k,v]) => v && (
                  <li key={k}>{k}: {v}</li>
                ))}
              </ul>
            </div>
            <div className="bg-black/20 p-4 rounded">
              <h3 className="font-semibold mb-2">Socials</h3>
              <ul className="text-white/80 text-sm">
                {(profile.socials || []).map((s, idx) => (
                  <li key={idx}>{s.platform}: {s.handle}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Proof of Work (SBTs)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {(profile.proofs || []).map((p, idx) => (
                <div key={idx} className="bg-black/20 rounded p-4">
                  <div className="text-sm text-white/60">Issuer: {p.issuerAddress}</div>
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="text-sm text-white/70">Token: {p.tokenId}</div>
                  {p.imageCid && (
                    <img alt="proof" className="mt-2 rounded" src={`${import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud'}/ipfs/${p.imageCid}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


