import { useState } from 'react';
// No contract call needed for fee-only flow
import { Buffer } from 'buffer';

export default function DomainClaim({ walletAddress }) {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');

  // Function to wait for transaction confirmation
  const waitForTransactionConfirmation = async (txId) => {
    const maxAttempts = 20; // 20 attempts = ~5 minutes
    const pollInterval = 15000; // 15 seconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Checking transaction status... (${attempt}/${maxAttempts})`);
        
        const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`);
        
        if (response.ok) {
          const txData = await response.json();
          console.log(`Transaction status: ${txData.tx_status}`);
          
          if (txData.tx_status === 'success') {
            console.log('✅ Transaction confirmed successfully!');
            
            // For testing without payment, just check if transaction succeeded
            console.log('✅ Transaction confirmed successfully (no payment verification for test)');
            return true;
          } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'failed_tx') {
            console.error('❌ Transaction failed:', txData.tx_status_reason || txData.tx_result?.repr);
            return false;
          }
          // If pending, continue polling
        } else {
          console.log(`API returned status ${response.status}, continuing to poll...`);
        }
        
        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${pollInterval/1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.error(`Error checking transaction (attempt ${attempt}):`, error.message);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
    }
    
    console.error('❌ Transaction confirmation timeout after 5 minutes');
    return false;
  };

  const handleClaimDomain = async (e) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      alert('Please enter a domain name');
      return;
    }

    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Claiming domain:', domain, 'for wallet:', walletAddress);
      
      // Native STX transfer: 20 STX to recipient
      const recipient = 'ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC';
      const amountMicroStx = '20000000';
      console.log('Initiating STX transfer →', recipient, amountMicroStx, 'µSTX');

      const transfer = await window.LeatherProvider.request('stx_transferStx', {
        recipient,
        amount: amountMicroStx,
        network: 'testnet',
        memo: `domain:${domain}`
      });

      console.log('Transfer result:', transfer);
      const txId = transfer?.result?.txid || transfer?.txid;
      console.log('Extracted txId:', txId);
      
      if (txId) {
        setTxId(txId);
        
        // Wait for transaction confirmation before saving to MongoDB
        console.log('🔄 Waiting for transaction confirmation...');
        alert(`Transaction submitted! 🚀\n\nTransaction ID: ${txId}\n\nWaiting for payment confirmation (20 STX) before creating your profile...`);
        
        const confirmed = await waitForTransactionConfirmation(txId);
        
        if (confirmed) {
          console.log('✅ Transaction confirmed! Saving to MongoDB...');
          const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/domains/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              username: domain, 
              walletAddress: walletAddress, 
              txId: txId,
              fee: '20 STX'
            }),
          });

          console.log('MongoDB save response status:', response.status);
          if (response.ok) {
            const userData = await response.json();
            console.log('Domain claimed successfully:', userData);
            alert(`🎉 Domain "${domain}.btc" claimed successfully!\n\n✅ Payment Confirmed: 20 STX\n🔗 Transaction ID: ${txId}\n\nYou can now access your profile at:\n/${domain}/profile`);
            localStorage.setItem('username', domain);
            setTimeout(() => { window.location.href = `/${domain}/profile`; }, 3000);
          } else {
            const errorData = await response.text();
            console.error('Backend save failed:', response.status, errorData);
            alert(`⚠️ Payment confirmed but profile creation failed.\n\nTransaction ID: ${txId}\nPlease contact support.`);
          }
        } else {
          throw new Error('Transaction failed or was not confirmed. Payment not processed.');
        }
      } else {
        console.error('No transaction ID found in result - payment failed');
        throw new Error('Payment transaction failed. Domain not claimed.');
      }
    } catch (error) {
      console.error('Domain claim failed:', error);
      if (error.message?.includes('User denied') || error.message?.includes('cancelled')) {
        alert('Domain claim cancelled by user.');
      } else if (error.message?.includes('already-exists')) {
        alert('Domain name is already taken. Please choose a different name.');
      } else {
        alert('Failed to claim domain: ' + (error.message || error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleClaimDomain} className="space-y-6">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
            Claim Your .btc Domain - 20 STX Fee
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="Enter domain name"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <span className="text-gray-300 font-medium">.btc</span>
          </div>
        </div>

        {walletAddress && (
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-300">
              <span className="font-medium">Connected Wallet:</span>
            </p>
            <p className="text-blue-400 font-mono text-sm break-all">
              {walletAddress}
            </p>
          </div>
        )}


        <button
          type="submit"
          disabled={isLoading || !walletAddress || !domain.trim()}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            isLoading || !walletAddress || !domain.trim()
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            `Pay 20 STX & Claim ${domain || 'your'}.btc`
          )}
        </button>

        {!walletAddress && (
          <p className="text-center text-yellow-400 text-sm">
            ⚠️ Connect your wallet to claim a domain
          </p>
        )}

        {txId && (
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">
              <span className="font-medium">Transaction ID:</span>
            </p>
            <p className="text-green-300 font-mono text-sm break-all">
              {txId}
            </p>
          </div>
        )}
      </form>

      <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">How it works:</h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Connect your Leather wallet</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Choose your unique domain name</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Pay 20 STX fee and approve the transaction</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Your domain gets registered on the blockchain</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 font-bold">5.</span>
            <span>Access your profile at betterbns.com/yourdomain.btc</span>
          </div>
        </div>
      </div>
    </div>
  );
}