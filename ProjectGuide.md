## Stack Tag – MERN + Stacks Testnet MVP

### 1) Prerequisites
- Node.js 20.19+ (React 19 + Vite 7 require it). Install from nodejs.org or use nvm.
- Git, MongoDB (local or Atlas), a Pinata account (IPFS), and a Stacks wallet.

### 2) Project structure
```
client/     # React (Vite) app with Tailwind
server/     # Express API with MongoDB, Pinata, Stacks SDK
contract/   # Clarity contracts (better-bns, better-sbt)
```

### 3) Environment
- Create `server/.env` from `server/.env.example`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/stack_tag
PINATA_JWT=YOUR_PINATA_JWT
PINATA_GATEWAY=https://gateway.pinata.cloud
STACKS_NETWORK=testnet
STACKS_CORE_API=https://stacks-node-api.testnet.stacks.co
APP_DEPLOYMENT_ORIGIN=http://localhost:5173
```

- Create `client/.env` from `client/.env.example`:
```
VITE_API_BASE=http://localhost:5000/api
VITE_STACKS_NETWORK=testnet
VITE_APP_NAME=Stack Tag
VITE_APP_URL=http://localhost:5173
```

### 4) Install & run (development)
In separate terminals:
```
cd server
npm i
npm run dev

cd client
npm i
npm run dev
```
Open `http://localhost:5173`.

### 5) Contracts
- `contract/better-bns.clar`: minimal name registry with `claim(name, owner)`.
- `contract/better-sbt.clar`: minimal SBT issuance `issue(recipient, metadata)`.

Use the Stacks CLI (Clarinet or Hiro tools) to deploy to testnet and capture:
- CONTRACT_ADDRESS
- BNS_CONTRACT_NAME=better-bns
- SBT_CONTRACT_NAME=better-sbt
Set them in `server/.env` if needed for server hints.

### 6) API overview
- `GET /api/health` – health check
- `POST /api/profile` – create/update profile
- `GET /api/profile/:bnsName` – fetch profile
- `POST /api/profile/:bnsName/proofs` – append a proof record
- `POST /api/upload/image` – upload image to IPFS via Pinata (form field `file`)
- `POST /api/stacks/prepare-claim` – server-side helper returning a suggested contract-call payload for the client to sign with Stacks Connect

### 7) Client MVP
- Landing page with gradient and name input to claim `.btc`
- Header wallet button (wires to Stacks Connect in next steps)
- Routes for `/`, future `/dashboard`, and dynamic `/[name].btc`

### 8) Production notes
- Use MongoDB Atlas and Pinata JWT with limited scopes.
- Add CORS origins and rate limiting.
- Deploy client on Vercel and server on Render/Fly/EC2.


