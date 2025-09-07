# Simple BNS Deployment Guide

## Overview
This simplified version requires users to pay 20 STX to claim a `.btc` domain. The fee goes to `ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC` and domain info is stored only in MongoDB.

## 1. Deploy Smart Contract

Open your browser's DevTools Console and run this script:

```javascript
const contractName = "simple-bns-v1"; // Use unique name

const clarityCode = `
;; Simple BNS Contract - 20 STX fee to specific address
;; Target address: ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC

(define-constant err-already-exists (err u100))
(define-constant err-invalid-name (err u101))
(define-constant err-payment-failed (err u102))

;; Fixed fee and recipient
(define-constant domain-fee u20000000) ;; 20 STX in microSTX
(define-constant fee-recipient 'ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC)

;; Domain registry
(define-map domains 
  { name: (string-ascii 64) }
  { owner: principal, registered-at: uint, tx-id: (buff 32) }
)

;; Owner to domain mapping
(define-map domain-owners
  { owner: principal }
  { domain: (string-ascii 64) }
)

;; Validate domain name
(define-private (validate-domain-name (name (string-ascii 64)))
  (let ((len (len name)))
    (asserts! (>= len u3) err-invalid-name)
    (asserts! (<= len u32) err-invalid-name)
    (ok true)
  )
)

;; Check if domain is available
(define-read-only (is-domain-available (name (string-ascii 64)))
  (is-none (map-get? domains { name: name }))
)

;; Get domain info
(define-read-only (get-domain-info (name (string-ascii 64)))
  (map-get? domains { name: name })
)

;; Get domain by owner
(define-read-only (get-domain-by-owner (owner principal))
  (map-get? domain-owners { owner: owner })
)

;; Get domain fee
(define-read-only (get-domain-fee)
  domain-fee
)

;; Main function: Claim domain with 20 STX payment
(define-public (claim-domain (name (string-ascii 64)))
  (begin
    ;; Validate domain name
    (try! (validate-domain-name name))
    
    ;; Check if domain is available
    (asserts! (is-domain-available name) err-already-exists)
    
    ;; Transfer 20 STX to fee recipient
    (try! (stx-transfer? domain-fee tx-sender fee-recipient))
    
    ;; Register domain
    (map-set domains
      { name: name }
      { 
        owner: tx-sender, 
        registered-at: block-height,
        tx-id: (unwrap-panic (get-tx-id))
      }
    )
    
    ;; Set owner mapping
    (map-set domain-owners { owner: tx-sender } { domain: name })
    
    (ok name)
  )
)

;; Helper to get transaction ID (simplified)
(define-private (get-tx-id)
  (ok 0x0000000000000000000000000000000000000000000000000000000000000000)
)
`;

// Deploy the contract
const deploy = await window.LeatherProvider.request("stx_deployContract", {
  name: contractName,
  clarityCode,
  network: "testnet"
});

console.log("Deploy response:", deploy);
const txid = deploy?.result?.txid;

// Poll for confirmation
const pollUrl = `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txid}`;
const poll = async () => {
  try {
    const r = await fetch(pollUrl);
    if (!r.ok) { 
      console.log("API status:", r.status); 
      setTimeout(poll, 15000); 
      return; 
    }
    const j = await r.json();
    console.log("TX Status:", j.tx_status, j.tx_status_reason || "");
    if (j.tx_status === "success") { 
      console.log("✅ Contract deployed successfully!"); 
      return; 
    }
    if (j.tx_status === "abort_by_response" || j.tx_status === "failed_tx") { 
      console.error("❌ Deploy failed:", j); 
      return; 
    }
  } catch (e) { 
    console.log("Poll error:", e.message); 
  }
  setTimeout(poll, 15000);
};

poll();
```

## 2. Update Environment Variables

After successful deployment, update `client/.env`:

```env
VITE_API_BASE=http://localhost:5000
VITE_STACKS_NETWORK=testnet
VITE_BNS_CONTRACT_ADDRESS=ST2DVABXXQWKF9ZMJX0TV3HTR4498XY34C029J552
VITE_BNS_CONTRACT_NAME=simple-bns-v1
```

## 3. Start the Application

```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend  
cd client
npm run dev
```

## 4. Test Domain Claiming

1. Connect your Leather wallet
2. Enter a domain name (3-32 characters)
3. Click "Pay 20 STX & Claim your.btc"
4. Approve the transaction in Leather
5. Wait for confirmation
6. Your profile will be created at `/yourdomain/profile`

## How It Works

1. **Frontend**: User enters domain name and clicks claim
2. **Smart Contract**: Validates name, transfers 20 STX to `ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC`, registers domain
3. **Backend**: Saves domain claim info to MongoDB after successful blockchain transaction
4. **Profile**: User can access their profile and dashboard to customize

## API Endpoints

- `POST /api/domains/claim` - Claim a domain after payment
- `GET /api/domains/:username` - Get domain info
- `GET /api/domains/check/:username` - Check availability
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/:username` - Update profile

## Fee Structure

- **Domain Fee**: 20 STX (fixed)
- **Recipient**: `ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC`
- **Storage**: MongoDB only (no blockchain storage of profile data)
