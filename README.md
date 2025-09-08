# Stack Tag 🏷️

> **Decentralized Identity & Achievement Platform on Stacks Blockchain**

Stack your achievements, tag your identity, and showcase your proof-of-work in the decentralized cosmos. Stack Tag is the ultimate platform for claiming `.btc` domains and managing verifiable Soulbound Tokens (SBTs) on the Stacks blockchain.

---

## 🎥 Demo Video

[![Stack Tag Demo](https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Stack+Tag+Demo+%E2%96%B6%EF%B8%8F+Click+to+Play)](https://youtube.com/watch?v=YOUR_VIDEO_ID)

*Click to watch the full platform walkthrough*

---

## 📸 Platform Screenshots

### 🏠 Home Page - Claim Your .btc Domain
[![Home Page](https://via.placeholder.com/800x500/0f172a/3b82f6?text=Stack+Tag+Home+Page)](https://your-image-link.com)

### 👤 Profile Page - Showcase Your Identity
[![Profile Page](https://via.placeholder.com/800x500/0f172a/8b5cf6?text=User+Profile+Page)](https://your-image-link.com)

### 📊 Dashboard - Manage SBTs & Social Links
[![Dashboard](https://via.placeholder.com/800x500/0f172a/10b981?text=User+Dashboard)](https://your-image-link.com)

---

## 🚀 Features

### 🏷️ **Domain Management**
- **Claim .btc Domains**: Secure your unique identity on Stacks blockchain
- **20 STX Payment**: Fair pricing with blockchain verification
- **Instant Profiles**: Automatic profile creation after domain claim
- **Multiple Domains**: One wallet can claim multiple usernames

### 🏆 **Soulbound Token (SBT) System**
- **Import SBTs**: Add your achievements with image upload
- **Send SBTs**: Recognize others by sending achievement tokens
- **IPFS Storage**: Permanent, decentralized metadata storage
- **Rich Metadata**: Images, descriptions, and personal messages
- **Blockchain Secured**: True ownership via Stacks NFT standard

### 🔗 **Social Integration**
- **Multi-Platform Links**: Twitter, GitHub, Farcaster, Base, Lens, Instagram
- **Clickable Icons**: Direct links to your social profiles
- **Profile Customization**: Personalized bio and display settings
- **Social Proof**: Connect your digital identity across platforms

### 🌐 **Decentralized Infrastructure**
- **Stacks Blockchain**: Built on Bitcoin's security model
- **IPFS Storage**: Permanent, censorship-resistant data
- **Leather Wallet**: Seamless wallet integration
- **Smart Contracts**: Transparent, verifiable operations

---

## 🛠️ Tech Stack

### **Frontend**
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7.8.2-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-20.19+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.18.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.18.0-880000?style=for-the-badge&logo=mongoose&logoColor=white)

### **Blockchain & Storage**
![Stacks](https://img.shields.io/badge/Stacks-7.2.0-5546FF?style=for-the-badge&logo=stacks&logoColor=white)
![Clarity](https://img.shields.io/badge/Clarity-Smart_Contracts-5546FF?style=for-the-badge&logo=stacks&logoColor=white)
![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white)
![Bitcoin](https://img.shields.io/badge/Bitcoin-Security_Model-F7931E?style=for-the-badge&logo=bitcoin&logoColor=white)

### **Development Tools**
![ESLint](https://img.shields.io/badge/ESLint-9.33.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-3.1.10-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-2.0.2-FF6B6B?style=for-the-badge)

---

## 🏗️ Architecture Flow

```mermaid
graph TD
    A[🌐 User Browser] --> B[⚡ React Frontend]
    B --> C[🔗 Leather Wallet]
    B --> D[🖥️ Express Server]
    
    D --> E[🗄️ MongoDB]
    D --> F[📎 IPFS/Pinata]
    D --> G[⛓️ Stacks Blockchain]
    
    G --> H[💰 Fee Gate Contract]
    G --> I[🏆 SBT Transfer Contract]
    
    C --> G
    
    J[👤 Domain Claim] --> K[💳 20 STX Payment]
    K --> L[✅ Blockchain Verification]
    L --> M[📝 Profile Creation]
    
    N[🏆 SBT Import/Send] --> O[📤 IPFS Upload]
    O --> P[⛓️ Contract Call]
    P --> Q[👤 Profile Update]
    
    style A fill:#3b82f6
    style G fill:#5546ff
    style F fill:#65c2cb
    style E fill:#47a248
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.19+ ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use [Atlas](https://cloud.mongodb.com/))
- **Leather Wallet** ([Install](https://leather.io/))
- **Pinata Account** ([Sign up](https://pinata.cloud/))

### 1. Clone Repository
```bash
git clone https://github.com/your-username/stack-tag.git
cd stack-tag
```

### 2. Server Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

**Server Environment Variables:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stack_tag
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=https://gateway.pinata.cloud
STACKS_NETWORK=testnet
STACKS_CORE_API=https://stacks-node-api.testnet.stacks.co
SBT_CONTRACT_ADDRESS=your_contract_address
SBT_CONTRACT_NAME=sbt-transfer
```

### 3. Client Setup
```bash
cd ../client
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

**Client Environment Variables:**
```env
VITE_API_BASE=http://localhost:5000
VITE_STACKS_NETWORK=testnet
VITE_BNS_CONTRACT_ADDRESS=your_contract_address
VITE_BNS_CONTRACT_NAME=fee-gate
VITE_SBT_CONTRACT_ADDRESS=your_contract_address
VITE_SBT_CONTRACT_NAME=sbt-transfer
```

### 4. Deploy Smart Contracts
```bash
cd ../contracts

# Follow the SBT_DEPLOYMENT_GUIDE.md for detailed instructions
# Deploy via Hiro Platform (recommended) or CLI
```

### 5. Start Development Servers
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 📱 Usage Guide

### 🏷️ **Claiming a Domain**
1. Connect your Leather wallet
2. Enter desired username (3+ characters)
3. Pay 20 STX fee
4. Wait for blockchain confirmation
5. Access your profile at `/{username}/profile`

### 🏆 **Managing SBTs**
1. **Import SBT**: Dashboard → Import SBTs → Fill details + upload image
2. **Send SBT**: Dashboard → Send SBT → Enter recipient + SBT details
3. **View SBTs**: Visit any profile to see their achievements

### 🔗 **Social Links**
1. Go to Dashboard → Social Links
2. Add usernames for each platform
3. Links appear as clickable icons on your profile

---

## 🎯 Core Workflows

### Domain Claiming Flow
```
User Input → Wallet Connection → Payment (20 STX) → Blockchain Verification → Profile Creation → Success
```

### SBT Creation Flow
```
SBT Data → Image Upload (IPFS) → Metadata Upload (IPFS) → Database Storage → Profile Display
```

### SBT Sending Flow
```
Recipient Selection → SBT Creation → IPFS Upload → Recipient Profile Update → Success Notification
```

---

## 🌟 Platform Highlights

### ✨ **Unique Features**
- **True Ownership**: Blockchain-secured domains and SBTs
- **IPFS Integration**: Permanent, decentralized storage
- **Multi-Wallet Support**: Send SBTs to any Stacks address
- **Rich Metadata**: Images, messages, and attribution
- **Social Integration**: Connect all your digital identities

### 🔒 **Security & Decentralization**
- **Stacks Blockchain**: Built on Bitcoin's security model
- **Smart Contracts**: Transparent, verifiable operations
- **IPFS Storage**: Censorship-resistant data storage
- **Wallet Integration**: Non-custodial, user-controlled

### 🚀 **Performance & UX**
- **React 19**: Latest frontend technology
- **Modern UI**: Beautiful space-themed design
- **Real-time Updates**: Instant profile updates
- **Mobile Responsive**: Works on all devices

---

## 📊 Project Statistics

- **Smart Contracts**: 3 deployed contracts
- **API Endpoints**: 15+ RESTful endpoints
- **UI Components**: 20+ React components
- **Database Models**: Comprehensive user & SBT schemas
- **File Upload**: Image processing with IPFS
- **Authentication**: Wallet-based auth system

---

## 🏆 Built At

**Made with ❤️ at [Risein X Stacks Hackerhouse Goa](https://risein.com/hackathons/stacks-hackerhouse-goa)**

*Empowering developers to build the decentralized future on Stacks blockchain*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: [StackTag](https://github.com/Nouman-wp/StackTag-HackerHouse-Goa)
- **Documentation**: [docs.stacks.co/](https://docs.stacks.co/)
- **Stacks Explorer**: [explorer.stacks.co](https://explorer.stacks.co/?chain=testnet)
- **IPFS Gateway**: [gateway.pinata.cloud](https://gateway.pinata.cloud)

---

<div align="center">

**Stack Tag** - *Decentralized Identity Made Simple* 🚀

[![Stacks](https://img.shields.io/badge/Built_on-Stacks-5546FF?style=for-the-badge&logo=stacks)](https://stacks.org)
[![IPFS](https://img.shields.io/badge/Powered_by-IPFS-65C2CB?style=for-the-badge&logo=ipfs)](https://ipfs.io)
[![Bitcoin](https://img.shields.io/badge/Secured_by-Bitcoin-F7931E?style=for-the-badge&logo=bitcoin)](https://bitcoin.org)

</div>
