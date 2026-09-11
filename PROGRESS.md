# PROGRESS.md — Phase Gate Checklist

- [x] **Phase 0: Discovery & Live Network Probe**
  - Live Somnia Shannon testnet probe executed.
  - 18 recycled pools identified; pool `0xCb9cE35F...` recycled across 10 market instances.
  - `DISCOVERY.md` & `evidence/discovery-probe.json` saved.
  - **Gate A PASSED**.

- [x] **Phase 1: Core Provenance Mechanism**
  - `MarketIdentity`, `ScopeGate`, `HistoryAdapter`, `DecisionReceipt` implemented.
  - 13/13 unit tests passing in `tests/unit/`.
  - **Gate B PASSED**.

- [x] **Phase 2: Adversarial Break Tests & Controls**
  - Contamination attack, foreign asset injection, stale state, and receipt tampering tests implemented and passing.
  - Random row-removal control benchmark completed.
  - Evidence artifacts saved (`baseline.json`, `epochline.json`, `random_control.json`, `summary.json`).
  - Standalone verifier CLI (`npm run verify:evidence`) passing 24/24 checks.
  - **Gate C PASSED**.

- [x] **Phase 3: Live Execution Adapter & On-Chain Attestation**
  - `ExecutionAdapter` on-chain preflight gate built.
  - `EpochlineRegistry.sol` compiled and deployment scripts configured.
  - Faucet claim helper created for `0x89Ebc05dE83aB9752B95030218BB10A542b96B7C` and `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`.
  - **Gate D PASSED**.

- [x] **Phase 4 & 5: Testbed Lab UI & Ash-Grey Design System**
  - Interactive Provenance Lab with live market switcher and adversarial injection simulator.
  - Landing page with original architectural hero visual and institutional ash-grey palette.
  - Proof and Audit Center page.
  - Next.js production build (`npm run build`) passing 100%.

- [x] **Phase 6 & 7: Proof Package & Comprehensive README**
  - Governance documents written (`EVIDENCE.md`, `PROOF.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `PROGRESS.md`).
  - Research-grade `README.md` prepared.
