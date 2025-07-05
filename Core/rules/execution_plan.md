Execution Blueprint

**Audience:** Cursor AI Code Assistant\
**Objective:** Define a final, atomic, end-to-end lifecycle blueprint for the development, testing, UI/UX, animations, contract deployment, AI integration, and long-term maintenance of a global AI-powered escrow and paymaster platform. This document is enforceable as the single source of truth. Deviation, hallucination, or partial completion is strictly prohibited.

---

## 📦 Master Blueprint Structure

1. 🔧 Phase 0 — Project Scaffold & Architecture
2. 🔐 Phase 1 — Authentication & Access Control
3. ⚖️ Phase 2 — Escrow FSM Core
4. ⛽ Phase 3 — Paymaster, Gas Abstraction
5. 🧩 Phase 4 — Dispute & Arbitration Module
6. 🌐 Phase 5 — Industry Adapters & Oracles
7. 📊 Phase 6 — Dashboards, Admin Panels, Analytics
8. 🧱 Phase 7 — Security, QA, Docs, and Final Launch

Each phase includes:

- 💬 Atomic-level prompts
- 📁 Directory layout rules
- 🧪 Required tests (unit, integration, UI)
- 🧩 Component specifications
- 🎨 UI/UX expectations
- ✨ Animations, transitions, effects
- 📏 Cursor coding & generation rules

Cursor must use this as the immutable execution map for generation, QA, and collaboration.

---

## 🔧 Phase 0 — Scaffold, Stack & Foundation

### 🔨 Stack Overview

- **Frontend:** Next.js + TypeScript + Tailwind + Framer Motion + ShadCN + 3D scenes via Three.js
- **Backend:** Firebase Functions, Firestore DB
- **Smart Contracts:** Solidity (Hardhat local testing), deployed to EVM chains
- **Auth:** Firebase Auth (OTP, Wallet)
- **DevOps:** GitHub Actions, TurboRepo, Nx, Husky, Vitest

### 🏗 Repo Structure

```bash
monorepo/
├─ apps/
│  ├─ frontend/
│  ├─ backend/
│  └─ contracts/
├─ packages/
│  ├─ core/        # FSM engine
│  ├─ auth/        # Auth logic
│  ├─ paymaster/   # ERC-4337 logic
│  ├─ dispute/     # Arbitration
│  ├─ dashboard/   # Admin/user panels
│  ├─ schemas/     # Zod validation
│  ├─ ui/          # Reusable UI components
│  └─ utils/       # Shared helpers
├─ industry-plugins/
├─ .cursorrules/
```

### ⚙️ CI/CD, Automation & Dev Hygiene

- CI with GitHub Actions: install, lint, test, build
- Precommit checks: Husky for lint, types, tests
- Envs: `.env.example`, Firebase CLI setup

### 📜 README & Architecture

- Auto-generated high-level diagram
- Setup instructions
- Component lifecycle explanations

### 🧱 Cursor Execution Rules

- Lock all schema, FSM, contract logic files
- No duplicate components
- No redundant wrappers or extra files
- All additions must be DRY, centralized, documented
- Any refactor must improve existing modules, not bypass them

---

## 🔐 Phase 1 — Auth, Roles, Access Logic

### 🔑 Auth Methods

- Phone OTP (Firebase)
- Email OTP
- WalletConnect

### 👤 Role System

- Buyer, Seller, Broker, Admin, Arbiter, Paymaster
- Role-based routing

### 🧪 Zod Schemas + Vitest

- Validate signups, tokens, profile updates
- Unit tests per flow

### 🖼 UI/UX — Auth Screens

- AuthForm (shadcn UI)
- Step-by-step onboarding flow
- Role indicator badges
- Animated transitions between screens (Framer Motion)

### 🎯 Backend Functions

- `loginPhone`, `verifyPhoneOtp`, `walletLogin`
- Token issuance with user metadata

---

## ⚖️ Phase 2 — Escrow FSM Engine

### ⚙️ State Logic

- States: Draft → Funded → Approved → Released → Disputed → Resolved
- File: `packages/core/engine.ts`
- Transitions: `transition(state, event)`

### 💸 Contract: `Escrow.sol`

- ERC-20 & native support
- Functions: `createDeal`, `deposit`, `approve`, `release`, `cancel`
- AccessControl for roles
- NatSpec docs + full Hardhat coverage

### 🌐 APIs

- `createDeal`, `approveMilestone`, `fileDispute`, etc.
- Call FSM + smart contract

### 🧩 UI Components

- `DealWizard`: step-based wizard with animations
- `DealCard`: status, last update, parties
- `MilestoneList`: progress bar
- Transitions: fade, slide, scale
- Empty states & skeletons

---

## ⛽ Phase 3 — Paymaster Engine

### 🧾 Role Logic

- Sponsors, Delegates, Admins
- Contract: ERC-4337-compliant Paymaster
- Set maxGas per deal, whitelists

### 🔄 Integration API

- EstimateGas, RegisterSponsor
- Fallback to manual gas if failure

### 📊 UI

- Sponsor dashboard: usage, caps, credits
- Alerts on fallback events
- Gas animations (pulsing meter, burn rate)

---

## 🧩 Phase 4 — Dispute & Arbitration

### 🛠 Contract: `Dispute.sol`

- `fileDispute`, `respond`, `resolve`
- Arbiter multisig approval

### 📡 Backend

- Evidence uploads
- Notifications
- Moderator logs

### 🖼 UI

- `DisputeTimeline`
- `EvidenceGallery`
- `ArbiterPanel`
- PDF downloads, signed hashes

---

## 🌍 Phase 5 — Industry Adapters & Oracles

### 🔌 Plugin Support

- `/plugins/metals`, `/oil`, `/realestate`
- APIs for pricing, logistics, delivery verification

### 📈 Oracle Layer

- Chainlink / RedStone for price checks
- Webhooks for delivery state

---

## 📊 Phase 6 — Dashboards & Analytics

### 👤 User Dashboards

- Buyer: Active Deals, Payments
- Seller: Funds Released, Disputes
- Broker: Commission view

### 🧑‍💼 Admin Panel

- Role assignment
- Audit logs
- Gas usage

### 📉 Analytics

- Conversion heatmaps
- Volume per industry
- Escrow success/failure rate
- Graphs via Recharts, D3

---

## 🛡 Phase 7 — Security, QA, Docs, Launch

### 🔐 Security

- Slither, MythX for contracts
- Firebase rules locked
- Admin-only backend paths

### 📚 Documentation

- Docusaurus site
- Diagrams, API playground
- Code: JSDoc, NatSpec

### ✅ QA & Deployment

- Playwright E2E tests
- UAT test matrix
- Launch plan with checklist, onboarding wizard
- Press kit and investor PDF

---

## ✳️ Final Enforcement

- Cursor must follow atomic prompts and locked definitions
- No unexplained file branching
- FSM and core contracts are sacred
- Prompts and components must not be hallucinated or split unless authorized
- Zod + NatSpec required across platform

> This document is the complete atomic blueprint for the platform. Cursor must treat it as immutable unless new amendments are explicitly authorized.

