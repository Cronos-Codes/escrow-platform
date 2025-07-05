Full project Blueprint

**Audience:** Cursor AI Code Assistant\
**Purpose:** This document serves as the exhaustive, enforceable, and atom-level blueprint that governs all architecture, code generation, development phases, versioning, upgrades, and operational decisions related to the AI-powered escrow and paymaster system. Cursor must adhere to it with zero deviation.


## 1. Vision, Objectives & Lifecycle Principles

### 1.1 Vision

Build a **modular**, **resilient**, and **AI-powered** escrow and paymaster platform for high-value transactions across global markets with an initial focus on Africa and the Middle East. It must accommodate digital and physical assets — real estate, oil & gas, precious metals, collectibles, intellectual property, and large-scale services.

### 1.2 Core Objectives

1. **Immutable Trust:** Escrow and arbitration contracts on-chain with verifiable audit trails.
2. **User Role Diversity:** Robust onboarding for sellers, brokers, buyers, sponsors, arbiters, and admins.
3. **Smart Escrow:** Programmable deal conditions, release mechanisms, and timeouts.
4. **AI Automation:** Risk scoring, smart contract audits, dispute triage, and dashboard insights.
5. **Seamless UX:** Frictionless onboarding, phone-based OTP, wallet login, and gas abstraction.
6. **Zero-Drift Development:** Enforced code hygiene and structure across every generated artifact.

### 1.3 Lifecycle Development Principles

- **Cursor-First:** Code must be generated, maintained, and structured solely under Cursor directives.
- **Single Responsibility Modules:** Each file/package must serve one purpose, no overlap.
- **Deterministic Architecture:** No duplication, drift, or redundant component sprawl.
- **Strict Boundaries:** Code must not self-fork or mutate responsibilities mid-project.
- **Smart Merging:** Similar functionality must be merged into composable logic, not split across files.
- **Auditability:** Code, data flows, and operations must be explainable to humans and machines.

---

## 2. Full Project Lifecycle Phases

Each phase includes front/backend/contracts, tests, AI integration, and operational scaffolding.

### Phase 0: Initialization (3 days)

- Define project architecture, tech stack, repo structure, environment files.
- Scaffold a mono-repo with Firebase backend, Hardhat + Solidity smart contracts, and Vercel frontend.
- Initialize Cursor rules and guardrails.
- Lock dependencies and set up CI/CD pipelines.

### Phase 1: Auth, KYC & Role Systems (5 days)

- Firebase phone/email OTP + WalletConnect login.
- Create reusable auth modules in `packages/auth`.
- Implement RBAC: buyer, seller, broker, admin, sponsor, arbiter.
- Develop onboarding dashboard for each role.

### Phase 2: Core Escrow Engine (7 days)

- Design FSM contract and service for state transitions.
- Implement smart contract (`Escrow.sol`) with state lifecycle: Created → Funded → Approved → Released/Disputed → Complete.
- Implement logic in `core/engine.ts` to track deal flow.
- Integrate Firestore, Firebase Functions, and on-chain event sync.

### Phase 3: Paymaster & Sponsor Logic (6 days)

- Implement EIP-4337 Paymaster with `Paymaster.sol` and bundler logic.
- Sponsors can fund user gas; policy logic handled off-chain.
- UI for sponsor dashboard, spend limits, reimbursement tracking.

### Phase 4: Dispute Resolution (6 days)

- AI model classifies disputes by severity and triggers arbitration.
- Arbiters or DAO courts (e.g., Kleros) provide decisions.
- Admin fallback for dispute resolution with full logging.
- UI for file dispute, voting, arbitration outcome.

### Phase 5: Industry-Specific Plugins (8 days)

- Real estate: Deed tokenization and property data ingestion.
- Metals: Assay certificates and third-party validation integration.
- Oil & Gas: Track shipments and custody via oracles.
- Modular plugin system supports industry logic via shared APIs.

### Phase 6: User & Admin Dashboards (5 days)

- Role-based dashboards for tracking deals, disputes, KPIs.
- Admin control panel for fraud alerts, overrides, compliance.
- Export reports, monitor user behavior, AI insight visualizations.

### Phase 7: Security, Docs & Launch (5 days)

- Contract audits (Slither/MythX), failover testing.
- End-to-end load testing with Hardhat mainnet fork.
- Generate full Swagger + NatSpec docs.
- Deploy: Mainnet contracts, Vercel frontend, Cloud Run backend.
- Monitor, log, alert, prepare hotfix and upgrade paths.

---

## 3. Repository Layout & Modules

```
/monorepo
 ├─ apps/
 │   ├─ frontend/           # UI, routes, components
 │   └─ backend/            # Firebase Functions, triggers
 ├─ apps/contracts/         # Solidity smart contracts
 ├─ packages/core/          # FSM engine, deal logic
 ├─ packages/auth/          # OTP, Wallet login, role utils
 ├─ packages/paymaster/     # Sponsor logic, bundler hooks
 ├─ packages/dispute/       # AI classifier, arbitration
 ├─ packages/dashboard/     # Charts, data viz, admin tools
 ├─ packages/schemas/       # Zod + JSON schemas
 ├─ packages/ui/            # ShadCN components
 ├─ packages/utils/         # Crypto, logger, date utils
```

---

## 4. Enforced Cursor Coding Rules (Project-Wide)

### 4.1 Code Hygiene Rules

- Never duplicate existing components.
- Always reuse existing utils/helpers if present.
- Do not create a new file if logic can be embedded or composed.
- Stick to modular single-purpose files.
- Auto-delete unused files/components.

### 4.2 Structure & Strategy Rules

- Do not change strategies or architecture mid-project.
- File organization must follow `/apps/` and `/packages/` model strictly.
- Avoid unnecessary abstraction layers unless justified.
- Changes to architecture require blueprint update.

### 4.3 Component Rules

- No UI component may be created without checking `/ui` or `/frontend/components` first.
- Group components by domain responsibility (auth, escrow, paymaster).
- Shared hooks or utils must be placed in `packages/`, not repeated per app.

### 4.4 Versioning & Maintenance Rules

- Version modules per semantic rules.
- Keep schema contracts backward-compatible or document migrations.
- All refactors must maintain parity with contract/API schemas.

---

## 5. Security, Monitoring & Ops

- Use Slither/MythX for smart contract static scans.
- Enable Firebase rules for auth/data isolation.
- Log frontend errors with LogRocket, backend errors to Stackdriver.
- Prometheus for contract events, alert if dispute rate > threshold.

---

## 6. Deployment, Scaling & Upgrade Plan

- Blue/Green deployments with Vercel/Cloud Run.
- Proxy-based upgradeable contracts.
- Secrets via GitHub Actions and Firebase vault.
- Firestore autoscaling, cold archive for inactive deals.
- DAO-controlled upgrade scripts.

---

## 7. Final Statement

**This document is the final, enforceable, and immutable atomic blueprint for the AI-powered escrow and paymaster platform. Cursor must obey it strictly. No hallucinations, mutations, or divergence from its logic is permitted across the codebase, structure, tests, or architecture. All code, design, and evolution must adhere to it until a newer blueprint is explicitly approved.**

