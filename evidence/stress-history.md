# STRESS-HISTORY.md — Adversarial Stress Tests & Remediation Log

This document records the empirical stress tests, boundary conditions, edge cases, and remediation history evaluated on the EPOCHLINE provenance firewall and cryptographic execution pipeline.

---

## 1. Summary of Evaluated Stress Vectors

| Attack Vector / Edge Case | Test Type | Input Condition | System Response | Security Verdict |
|---|---|---|---|---|
| **Temporal Edge Off-by-One** | Boundary Condition | Fills submitted at $t = \text{start}-1$, $t = \text{start}$, $t = \text{expiry}$, and $t = \text{expiry}+1$ | Exact inclusive interval $[t_{\text{start}}, t_{\text{expiry}}]$ enforced; $t-1$ and $t+1$ rejected with `TEMPORAL_OUT_OF_BOUNDS`. | **SAFE (ENFORCED)** |
| **Missing Timestamp on Time-Series** | Provenance Evasion | Fill has valid `marketId` and `poolAddress` but omits `timestamp` (`undefined`) | Hardened to fail closed with `PROVENANCE_MISSING` code on time-series streams (`fills`, `candles`, `orders`). | **SAFE (HARDENED)** |
| **Cross-Epoch Intent Replay Race** | TOCTOU / Replay | Valid Decision Receipt for Market A executed against successor Market B reusing the identical pool contract | `verifyExecutionSeal` detects `marketId` mismatch and aborts execution. | **SAFE (BLOCKED)** |
| **JSON Canonicalization Invariance** | Cryptographic Hashing | Proof and receipt keys permuted arbitrarily before hashing | Deterministic key sorting (`canonicalizeJson`) guarantees identical Keccak-256 hash irrespective of serialization order. | **SAFE (VERIFIED)** |
| **Heuristic Subsampling Failure** | Control Experiment | 50% random row removal on pool history | Random control retains 50% foreign BTC contamination, proving deterministic scoping is mandatory. | **SAFE (VERIFIED)** |

---

## 2. Detailed Stress Test Reports

### Stress Test 1: Exact Millisecond Boundary Off-by-One
- **Objective**: Verify whether temporal interval scoping is inclusive or allows off-by-one boundary leaks.
- **Target Market**: `0x00...019262` (Trading Window: `1789047180` to `1789047240`).
- **Test Executions**:
  1. `timestamp: 1789047179` ($t_{\text{start}} - 1$) $\to$ `REJECT` (`TEMPORAL_OUT_OF_BOUNDS`)
  2. `timestamp: 1789047180` ($t_{\text{start}}$) $\to$ `ACCEPT` (Valid boundary fill)
  3. `timestamp: 1789047240` ($t_{\text{expiry}}$) $\to$ `ACCEPT` (Valid boundary fill)
  4. `timestamp: 1789047241` ($t_{\text{expiry}} + 1$) $\to$ `REJECT` (`TEMPORAL_OUT_OF_BOUNDS`)
- **Conclusion**: The temporal scope gate strictly bounds reads to $[t_{\text{start}}, t_{\text{expiry}}]$ without boundary creep.

### Stress Test 2: Missing Timestamp on Time-Series Feeds
- **Objective**: Test if an adversary can evade the temporal gate by stripping the `timestamp` field while providing valid `marketId` and `poolAddress`.
- **Finding**: In an earlier iteration, `timestamp !== undefined` allowed untimestamped rows to bypass the boundary check.
- **Remediation**: `ScopeGate` was hardened to mandate numeric timestamps on all time-series sources (`fills`, `candles`, `orders`). Any time-series row missing a valid timestamp is immediately flagged with `PROVENANCE_MISSING` and refused.

### Stress Test 3: Successor Market TOCTOU Race
- **Objective**: An agent obtains a valid decision receipt on Market A (ETH 60s). At market expiry, the pool is recycled by the DreamDEX factory into Market B (BTC 60s). The agent attempts to submit the signed execution seal against Market B.
- **Result**: `verifyExecutionSeal` compares `seal.intent.marketId` against `receipt.market.marketId` and rejects with `Market ID mismatch`.

### Stress Test 4: Key Permutation & Hash Invariance
- **Objective**: Test whether differing JSON key serialization between TypeScript runtimes and client browsers could alter receipt hashes.
- **Result**: `canonicalizeJson` recursively sorts all object keys alphabetically before computing Keccak-256 hashes, ensuring deterministic hash parity across all execution environments.

---

## 3. Reproducibility

Run the full boundary stress suite:

```bash
npx tsx scripts/stress-boundary-test.ts
```
