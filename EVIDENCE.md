# EVIDENCE.md — EPOCHLINE Empirical Evidence & Audit Log

This document records the empirical evidence captured live on **Somnia Shannon Testnet** (Chain ID: `50312`) establishing the fundamental contradiction in DreamDEX Event Contracts pool recycling and verifying the EPOCHLINE provenance firewall.

---

## 1. Testnet Ground Truth & Target Market

- **Live App**: [https://epochline.vercel.app](https://epochline.vercel.app)
- **Provenance Lab**: [https://epochline.vercel.app/lab](https://epochline.vercel.app/lab)
- **Proof Center**: [https://epochline.vercel.app/proof](https://epochline.vercel.app/proof)
- **Network**: Somnia Shannon Testnet
- **Chain ID**: `50312`
- **Captured Block**: `#484739551`
- **RPC Endpoint**: `https://dream-rpc.somnia.network`
- **Explorer**: `https://shannon-explorer.somnia.network`

### Target Market Identity
- **marketId**: `0x0000000000000000000000000000000000000000000000000000000000019262`
- **symbol**: `ETH 60s`
- **asset**: `ETH`
- **intervalSec**: `60`
- **tradingStart**: `1789047180`
- **expiry**: `1789047240`
- **marketAddress**: `0x3ecC694Cef705358864a646142ac17A90E29e388`
- **poolAddress**: `0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f`
- **on-chain status**: `Trading` (`1`)

---

## 2. Observed Recycled Pools Anomaly

A scan of 100 markets on-chain revealed **18 recycled pool contracts** shared across multiple rolling market windows.

### Recycled Pool `0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f`
Shared across **10 distinct market instances** spanning different assets (BTC and ETH) and temporal cadences:

| marketId | symbol | start | expiry | on-chain status |
|---|---|---:|---:|---|
| `0x00...019262` | ETH 60s | 1789047180 | 1789047240 | Trading |
| `0x00...01925d` | BTC 60s | 1789047060 | 1789047120 | Resolved |
| `0x00...019248` | ETH 300s | 1789046700 | 1789047000 | Resolved |
| `0x00...019241` | BTC 60s | 1789046520 | 1789046580 | Resolved |
| `0x00...01923b` | BTC 60s | 1789046400 | 1789046460 | Resolved |
| `0x00...019227` | BTC 60s | 1789046040 | 1789046100 | Resolved |
| `0x00...019224` | ETH 60s | 1789045920 | 1789045980 | Resolved |
| `0x00...01921d` | BTC 60s | 1789045800 | 1789045860 | Resolved |
| `0x00...01920b` | BTC 60s | 1789045440 | 1789045500 | Resolved |
| `0x00...0191fe` | ETH 60s | 1789045200 | 1789045260 | Resolved |

---

## 3. Comparative Benchmark Summary

| Metric | Naive Baseline | Random Removal Control | EPOCHLINE Firewall |
|---|---|---|---|
| **Query Strategy** | Pool-Keyed (`readPoolHistory`) | Random Subsample | Identity-Scoped (`ScopeGate`) |
| **Total Ingested Rows** | 20 rows | 10 rows | 20 evaluated |
| **Retained Target Rows** | 10 rows | 5 rows | 10 rows (100% Target) |
| **Retained Foreign Rows** | 10 rows (50% Contamination) | 5 rows (50% Contamination) | 0 rows (0% Contamination) |
| **System Verdict** | ACCEPTED (VULNERABLE) | REJECT | REFUSED (SAFE) |
| **Calculated Momentum Price** | 0.48 (Distorted by BTC fills) | 0.49 (Distorted) | 0.64 (Clean ETH order flow) |
| **Decision Receipt State** | Unchecked / Fake Valid | Invalid / Tampered | Cryptographically Verified VALID |

---

## 4. Live Deployed On-Chain Contracts & Transactions

### EpochlineRegistry Attestation Contract
- **Contract Address**: `0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5`
- **Deployment Tx Hash**: `0x108befe5b3f2823f070438ac5af90cc84243e1428d40d165c4c21813e240bb45`
- **Deployment Block**: `#485361705`
- **Explorer Link**: [View Deployment on Shannon Explorer](https://shannon-explorer.somnia.network/tx/0x108befe5b3f2823f070438ac5af90cc84243e1428d40d165c4c21813e240bb45)

### On-Chain Decision Receipt Anchor
- **Anchor Tx Hash**: `0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e`
- **Anchor Block**: `#485365853`
- **Target Market ID**: `0x0000000000000000000000000000000000000000000000000000000000019262`
- **Anchored Receipt Hash**: `0xfb8b51922805b0a8c41b51f774d7b4a20463fd1bda8312821f996f4e254c8300`
- **Explorer Link**: [View Anchor Tx on Shannon Explorer](https://shannon-explorer.somnia.network/tx/0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e)

### On-Chain Execution Seal Anchor
- **Execution Seal Tx Hash**: `0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7`
- **Execution Seal Block**: `#485365868`
- **Signer**: `0xe4B713e3cF2E550147f9cc09d751f276E7B9A64e`
- **Explorer Link**: [View Execution Seal Tx on Shannon Explorer](https://shannon-explorer.somnia.network/tx/0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7)

### Protocol Contracts & Verified Faucets
- **DreamDEX Binary Module**: `0x3ecC694Cef705358864a646142ac17A90E29e388`
- **Direct DreamDEX Token Faucet (SOMI, WBTC, WETH)**: `0x89Ebc05dE83aB9752B95030218BB10A542b96B7C`
- **TestUSDC Collateral Faucet**: `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`

---

## 5. Automated Verifier Command

To verify all cryptographic evidence hashes and benchmark receipts independently:

```bash
npm run verify:evidence
```
