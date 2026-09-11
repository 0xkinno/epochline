# PROGRESS.md — Phase Gate Checklist

- [x] **Phase 0: Discovery & Live Network Probe**
  - Live Somnia Shannon testnet probe executed.
  - 18 recycled pools identified; pool `0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f` recycled across 10 market instances.
  - `DISCOVERY.md` & `evidence/discovery-probe.json` saved.
  - **Gate A PASSED**.

- [x] **Phase 1: Core Provenance Mechanism**
  - `MarketIdentity`, `ScopeGate`, `HistoryAdapter`, `DecisionReceipt` implemented.
  - 21/21 unit & adversarial tests passing in `tests/`.
  - **Gate B PASSED**.

- [x] **Phase 2: Adversarial Break Tests & Controls**
  - Contamination attack, foreign asset injection, stale state, and receipt tampering tests passing.
  - Random row-removal control benchmark completed.
  - Evidence artifacts saved (`baseline.json`, `epochline.json`, `random_control.json`, `summary.json`).
  - Standalone verifier CLI (`npm run verify:evidence`) passing 30/30 checks.
  - **Gate C PASSED**.

- [x] **Phase 3: Live Execution Adapter & On-Chain Attestation**
  - `ExecutionAdapter`, `ExecutionSeal`, `ExecutionVerifier`, and `SettlementAudit` built.
  - `EpochlineRegistry.sol` deployed at `0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5` (Block `#485361705`).
  - Decision Receipt Anchor confirmed at `0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e` (Block `#485365853`).
  - Execution Seal Anchor confirmed at `0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7` (Block `#485365868`).
  - **Gate D PASSED**.

- [x] **Phase 4 & 5: Testbed Lab UI & Ash-Grey Design System**
  - Interactive Provenance Lab (`/lab`) with live market switcher, comparative cards, and real wallet execution seals.
  - Editorial landing page (`/`) with architectural hero visual and dark/light theme switching.
  - Proof & Audit Center (`/proof`) with live testnet hashes and verification checklist.
  - Next.js production build (`npm run build`) passing 100% cleanly.
  - Production deployment live at **[https://epochline.vercel.app](https://epochline.vercel.app)**.

- [x] **Phase 6 & 7: Proof Package & Playwright/Chromium Verification**
  - Headless Chromium CDP audit (`npm run test:e2e`) passing 29/29 checks across all 7 responsive viewports.
  - Multi-viewport and landing banner screenshots captured in `evidence/screenshots/`.
  - Comprehensive research-grade `README.md` and verification suite complete.

