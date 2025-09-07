/**
 * Utility functions for managing wallet storage and session data
 */

export const clearAllWalletData = (hard = false) => {
  try {
    // Known keys from older stacks/connect and blockstack
    const keysToRemove = [
      'walletAddress',
      'username',
      'userSession',
      'blockstack-session',
      'blockstack-transit-private-key',
      'stx-accounts',
      'connect:addresses',
      'connect:data',
      'connect:wallet',
      'stacks-wallet-selected',
    ];
    keysToRemove.forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
      try { sessionStorage.removeItem(k); } catch {}
    });

    // Remove any other connect-related cached entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.includes('connect') || key.includes('stacks') || key.includes('blockstack')) {
        try { localStorage.removeItem(key); } catch {}
      }
    }

    if (hard) {
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    }

    console.log('Wallet storage cleared', { hard });
  } catch (e) {
    console.log('clearAllWalletData error', e);
  }
};

export const getStoredWalletData = () => {
  return {
    walletAddress: localStorage.getItem('walletAddress'),
    username: localStorage.getItem('username'),
    userSession: localStorage.getItem('userSession'),
    blockstackSession: localStorage.getItem('blockstack-session'),
  };
};

export const debugWalletStorage = () => {
  const data = getStoredWalletData();
  console.log('Current wallet storage data:', data);
  return data;
};

