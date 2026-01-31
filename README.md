# ShadowStream

Production-ready private payroll platform for Web3 organizations on Solana.

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 8+
- Rust and Anchor 0.32.1+
- PostgreSQL database
- Solana CLI tools

### Setup (30 minutes)

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd solprivacyhackathon
pnpm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Set up database:**
```bash
cd packages/database
pnpm db:generate
pnpm db:push  # Use db:push for development, or db:migrate for production
pnpm db:seed
```

4. **Build contracts:**
```bash
cd packages/contracts
# See BUILD_SETUP.md for Solana platform tools setup
anchor build
anchor deploy --provider.cluster devnet
```

**Note:** Building requires Solana BPF target setup. See `packages/contracts/BUILD_SETUP.md` for details.

5. **Start development server:**
```bash
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
shadowstream/
├── apps/
│   ├── web/              # Next.js dashboard
│   └── contractor-portal/ # Contractor-facing app
├── packages/
│   ├── contracts/        # Solana Anchor programs
│   ├── sdk/              # TypeScript SDK
│   ├── database/         # Prisma schema
│   ├── api/              # tRPC routers
│   └── ui/               # Shared components
└── docs/                 # Documentation
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Smart Contracts](./docs/SMART_CONTRACTS.md)
- [Privacy Implementation](./docs/PRIVACY.md)

## License

MIT

## 🏆 Hackathon Submission

This project is submitted for the Solana Privacy Hackathon. See the following resources:

- **[Submission Checklist](./SUBMISSION_CHECKLIST.md)** - Complete verification of all submission requirements
- **[Demo Video Guide](./DEMO_GUIDE.md)** - Script and guide for creating the demo video

### Submission Requirements Status

✅ **Open Source** - MIT License  
✅ **Solana Integration** - Anchor program deployed on devnet  
✅ **Privacy Technology** - Custom encryption (NaCl Box) + Merkle commitments  
⚠️ **Deployment** - Verification needed (see checklist)  
📹 **Demo Video** - Guide ready, video pending  
✅ **Documentation** - Comprehensive docs included  

**Program ID:** `EsDigpm8edeaa7n6xxxUq5uL7mdkBJHgLKWpAqRbyjhC` (Devnet)  
**Explorer:** [View on Solana Explorer](https://explorer.solana.com/address/EsDigpm8edeaa7n6xxxUq5uL7mdkBJHgLKWpAqRbyjhC?cluster=devnet)
