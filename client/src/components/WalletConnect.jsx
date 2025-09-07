import { useEffect, useMemo, useState } from 'react';
import { AppConfig, showConnect, UserSession } from '@stacks/connect';

export default function WalletConnectButton({ onConnected }) {
  const [label, setLabel] = useState('Connect Wallet');
  const [userSession, setUserSession] = useState(null);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const appConfig = useMemo(() => new AppConfig(['store_write', 'publish_data']), []);

  useEffect(() => {
    const session = new UserSession({ appConfig });
    setUserSession(session);
    if (session.isUserSignedIn()) {
      const userData = session.loadUserData();
      const addr = userData.profile?.stxAddress?.testnet;
      if (addr) {
        setLabel(addr.slice(0, 6) + '...' + addr.slice(-4));
        onConnected?.(addr);
      }
    }
  }, [appConfig, onConnected]);

  const handleClick = () => {
    if (userSession?.isUserSignedIn()) {
      userSession.signUserOut();
      setLabel('Connect Wallet');
      onConnected?.(null);
    } else {
      showConnect({
        appDetails: { name: import.meta.env.VITE_APP_NAME || 'BetterBNS', icon: `${appUrl}/vite.svg` },
        onFinish: (payload) => {
          const addr = payload?.authResponsePayload?.profile?.stxAddress?.testnet;
          if (addr) {
            setLabel(addr.slice(0, 6) + '...' + addr.slice(-4));
            onConnected?.(addr);
          }
        },
      });
    }
  };

  return (
    <button onClick={handleClick} className="px-4 py-2 rounded bg-white/10 text-white hover:bg-white/20 transition">
      {label}
    </button>
  );
}


