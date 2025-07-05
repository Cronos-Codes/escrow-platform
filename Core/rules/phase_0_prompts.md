# Phase 0 Execution Instructions — Foundational Setup

**Audience:** Cursor AI Code Assistant\
**Purpose:** Execute all foundational operations to prepare the architecture, rules, structure, stubs, and documentation for the AI-powered Escrow & Paymaster platform. These are **strict instructional prompts**—follow each exactly.

---

## 0.1 — Monorepo Initialization

**Instruction:**

- Initialize a new **TurboRepo-based monorepo** using **PNPM**.
- Create the following **top-level folders**:
  - `apps/frontend`
  - `apps/backend`
  - `apps/contracts`
  - `packages/core`
  - `packages/auth`
  - `packages/paymaster`
  - `packages/dispute`
  - `packages/dashboard`
  - `packages/schemas`
  - `packages/ui`
  - `packages/utils`
  - `industry-plugins`
  - `scripts`
  - `.cursorrules`

**Details:**

- Generate a `package.json` at the root with properly declared PNPM workspaces.
- Generate a `pnpm-workspace.yaml` listing all folders.
- Add `turbo.json` (or `nx.json`) for pipeline and caching configuration.

---

## 0.2 — CI/CD Pipeline Configuration

**Instruction:**

- Create GitHub Actions workflows under `.github/workflows/ci.yml`.
- Configure it to trigger on `push` and `pull_request`.
- Steps:
  - Checkout code
  - Install with `pnpm install`
  - Run `pnpm lint`
  - Type-check with `pnpm tsc --noEmit`
  - Run tests with `pnpm test --coverage`
  - Run smart contract tests with `pnpm run contracts:test`
  - Build all apps using `pnpm build`

**Local Safety Nets:**

- Install Husky.
- Add `pre-commit` hook to lint and test before commit.

---

## 0.3 — AI Governance Rule System

**Instruction:**

- Create `.cursorrules/config.yaml`.
- Populate it with **complete enforcement rules**, including:
  - Prompt refinement
  - File duplication prevention
  - Monorepo structure locking
  - FSM-only contract transitions
  - Smart contract gas profiling
  - Contract auditing rules
  - KYC/AML enforcement
  - Naming conventions and strict types
  - UI, animation, and documentation guidelines

**Requirement:**

- Lock critical files:
  - `packages/core/engine.ts`
  - `apps/contracts/contracts/Escrow.sol`
  - `.cursorrules/config.yaml`

---

## 0.4 — Documentation & Environment Setup

**Instruction:**

- Generate root-level `README.md` including:

  - Project title, tagline, and objective
  - Architectural and tech stack overview
  - ASCII-style directory map
  - Quickstart install and dev guide:
    ```bash
    git clone <repo>
    pnpm install
    pnpm run dev:frontend
    pnpm run dev:backend
    pnpm run contracts:test
    ```
  - Reference links to the project blueprint and rules file

- Create `.env.example` with keys:

  ```
  FIREBASE_PROJECT_ID=
  FIREBASE_API_KEY=
  RPC_URL_MAINNET=
  RPC_URL_TESTNET=
  NEXT_PUBLIC_API_BASE_URL=
  ```

---

## 0.5 — Module Bootstrapping

**Instruction:** Generate minimal placeholder files for all major directories:

- **Frontend**: `apps/frontend/pages/index.tsx`

  - A React component returning a placeholder header: `Hello, Escrow World`

- **Backend**: `apps/backend/src/index.ts`

  - Export a Firebase Function responding with `Hello from Escrow Backend`

- **Smart Contracts**: `apps/contracts/contracts/Escrow.sol`

  - Empty Escrow contract with SPDX license and pragma

- **All Packages (**``**)**:

  - `src/index.ts` containing a `placeholder()` function with a TODO

---

## 0.6 — Verification Checklist

**Instruction:** Ensure the following before moving to Phase 1:

- Monorepo scaffolding complete
- All folders and files in correct place
- `pnpm install` passes with no errors
- CI pipeline runs successfully
- `.cursorrules/config.yaml` is valid YAML and logically complete
- Stubs generated correctly in each module

---

**Reminder:** Every instruction above is surgical. Do not deviate, refactor, rename, or reroute logic unless explicitly described in the blueprint or enforced by `.cursorrules/config.yaml`. This is the only approved structure for Phase 0.

---

