/**
 * Utility functions for detecting and working with Leather wallet
 */

export const detectLeatherWallet = () => {
  if (typeof window === 'undefined') return { available: false, reason: 'Not in browser' };

  // Check for various Leather wallet APIs
  const hasLeatherProvider = window.LeatherProvider && typeof window.LeatherProvider.request === 'function';
  const hasLeatherBTC = window.btc && typeof window.btc.request === 'function';
  const hasStacksProvider = window.StacksProvider && typeof window.StacksProvider.request === 'function';

  if (hasLeatherBTC || hasStacksProvider || hasLeatherProvider) {
    return { 
      available: true, 
      apis: {
        leatherProvider: hasLeatherProvider,
        btc: hasLeatherBTC,
        stacksProvider: hasStacksProvider
      }
    };
  }

  return { 
    available: false, 
    reason: 'Leather wallet not installed or not loaded yet',
    installUrl: 'https://leather.io/'
  };
};

export const waitForLeatherWallet = (timeout = 5000) => {
  return new Promise((resolve) => {
    const checkWallet = () => {
      const detection = detectLeatherWallet();
      if (detection.available) {
        resolve(detection);
        return;
      }
    };

    // Check immediately
    checkWallet();

    // Check every 500ms for up to timeout duration
    const interval = setInterval(checkWallet, 500);
    
    setTimeout(() => {
      clearInterval(interval);
      resolve(detectLeatherWallet());
    }, timeout);
  });
};

export const getLeatherWalletAddresses = async () => {
  const detection = detectLeatherWallet();
  if (!detection.available) {
    throw new Error('Leather wallet not available');
  }

  // Try different APIs in order of preference
  const apis = detection.apis;

  // Method 1: LeatherProvider (preferred) – use stx_getAddresses first
  if (apis.leatherProvider) {
    try {
      // 1a) stx_getAddresses (Leather supports this)
      let resp = await window.LeatherProvider.request('stx_getAddresses');
      let addresses = resp?.addresses || resp?.result?.addresses;
      if (Array.isArray(addresses)) {
        const stx = addresses.find(a => a.address && (a.symbol === 'STX' || a.type === 'stx' || !a.symbol));
        if (stx?.address) return { stacks: stx.address, method: 'stx_getAddresses' };
      }

      // 1b) getAddresses – parse result for STX
      // Try without params, then with explicit stacks/testnet hint
      const variants = [
        undefined,
        { purposes: ['stacks'], network: 'testnet' },
      ];
      for (const v of variants) {
        let response;
        try {
          response = v === undefined
            ? await window.LeatherProvider.request('getAddresses')
            : await window.LeatherProvider.request('getAddresses', v);
        } catch (e1) {
          // Try raw style
          response = v === undefined
            ? await window.LeatherProvider.request({ method: 'getAddresses' })
            : await window.LeatherProvider.request({ method: 'getAddresses', params: [v] });
        }
        const addrs = response?.addresses || response?.result?.addresses;
        if (Array.isArray(addrs)) {
          const stx = addrs.find(a => a.address && (a.symbol === 'STX' || a.type === 'stacks' || a.type === 'stx'));
          if (stx?.address) return { stacks: stx.address, method: 'leatherProvider' };
        }
      }
    } catch (error) {
      console.log('LeatherProvider failed:', error);
      try {
        const supported = await window.LeatherProvider.request('supportedMethods');
        console.log('Leather supported methods:', supported);
      } catch {}
    }
  }

  // Method 2: btc API as fallback
  if (apis.btc) {
    try {
      const response = await window.btc.request('getAddresses', { types: ['stacks'] });
      const addresses = response?.addresses || response?.result?.addresses;
      if (Array.isArray(addresses)) {
        const stacksAddr = addresses.find(a => a.type === 'stacks');
        if (stacksAddr?.address) {
          return { stacks: stacksAddr.address, method: 'btc' };
        }
      }
    } catch (error) {
      console.log('BTC API failed:', error);
    }
  }

  // Method 3: StacksProvider (legacy, often unsupported now)
  if (apis.stacksProvider) {
    try {
      const response = await window.StacksProvider.request('stx_getAccounts');
      const addrs = response?.result?.addresses;
      if (Array.isArray(addrs) && addrs.length > 0) {
        return { stacks: addrs[0], method: 'stacksProvider' };
      }
    } catch (error) {
      console.log('StacksProvider failed:', error);
    }
  }

  throw new Error('Unable to get addresses from any Leather wallet API');
};

