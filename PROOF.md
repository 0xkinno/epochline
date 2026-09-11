# PROOF.md — Cryptographic Proof & Invariant Specification

## 1. The Hard Invariant

> **A decision is VALID only when every piece of market-derived evidence belongs to the exact target canonical `marketId`, matches the registered pool and venue, and lies strictly within the target market's valid temporal window.**

Mathematically:

$$
\forall e \in \mathcal{E}_{\text{accepted}}, \quad \text{marketId}(e) = \text{marketId}_{\text{target}} \quad \land \quad t(e) \in [t_{\text{start}}, t_{\text{expiry}}] \quad \land \quad \text{pool}(e) = \text{pool}_{\text{target}}
$$

$$
\text{State} = \begin{cases} \text{VALID} & \text{if } |\mathcal{E}_{\text{offending}}| = 0 \land |\mathcal{E}_{\text{accepted}}| > 0 \land \text{Status}_{\text{onchain}} = 1 \\ \text{REFUSED} & \text{if } |\mathcal{E}_{\text{offending}}| > 0 \lor \text{Status}_{\text{onchain}} \neq 1 \\ \text{INCOMPLETE} & \text{if } |\mathcal{E}| = 0 \end{cases}
$$

---

## 2. Cryptographic Hashing Protocol

### Evidence Hash ($H_E$)
Deterministic Keccak-256 hash over sorted, canonicalized JSON representation of accepted evidence items:

$$
H_E = \text{Keccak256}(\text{Canonicalize}(\mathcal{E}_{\text{accepted}}))
$$

### Market Identity Hash ($H_M$)
Deterministic Keccak-256 hash over canonical `MarketIdentity` fields:

$$
H_M = \text{Keccak256}(\text{Canonicalize}(\text{MarketIdentity}))
$$

### Policy Hash ($H_P$)

$$
H_P = \text{Keccak256}(\text{"EPOCHLINE\_POLICY\_market-instance-v1"})
$$

### Receipt Hash ($H_R$)

$$
H_R = \text{Keccak256}(\text{Canonicalize}(\{ \text{Protocol}, \text{State}, \text{Market}, H_E, H_M, H_P, \text{Decision} \}))
$$

---

## 3. Adversarial Attack Test Matrix

| Attack Vector | Test Case | Target State | EPOCHLINE Output | Status |
|---|---|---|---|---|
| **Recycled Pool Contamination** | Attack A | Insert 5 BTC rows into ETH 60s pool history | `REFUSED: MARKET_MISMATCH` | **PASSED** |
| **Foreign Asset Injection** | Attack B | Inject out-of-venue BTC order into ETH market | `REFUSED: MARKET_MISMATCH` | **PASSED** |
| **Out-of-Window Ingestion** | Attack C | Inject fill with timestamp > expiry | `REFUSED: TEMPORAL_OUT_OF_BOUNDS` | **PASSED** |
| **Missing Provenance** | Attack D | Omit `marketId` on evidence item | `REFUSED: PROVENANCE_MISSING` | **PASSED** |
| **Receipt Tampering** | Attack E | Mutate decision price or action post-hash | `VERIFIER_FAIL: Receipt hash mismatch` | **PASSED** |

---

## 4. Verification CLI Log

```text
=================================================
   EPOCHLINE INDEPENDENT EVIDENCE VERIFIER CLI   
=================================================

[PASS] Discovery probe evidence exists
[PASS] Chain ID is Somnia Shannon Testnet (50312)
[PASS] Captured real on-chain block number > 480,000,000
[PASS] Discovered binary markets >= 50
[PASS] Probed live testnet markets count > 0
[PASS] Identified multiple market instances on recycled pools
[PASS] Direct DreamDEX Token Faucet verified on-chain
[PASS] TestUSDC Collateral Faucet verified on-chain
[PASS] Baseline evidence exists
[PASS] Baseline ingests contaminated rows without detection
[PASS] Baseline spans multiple distinct market IDs in one pool query
[PASS] EPOCHLINE intervention evidence exists
[PASS] EPOCHLINE successfully refused contaminated input
[PASS] EPOCHLINE caught MARKET_MISMATCH offending codes
[PASS] EPOCHLINE accepted 100% clean context
[PASS] Random control evidence exists
[PASS] Random removal still suffers from foreign row contamination
[PASS] ScopeGate correctly refuses random-removal control
[PASS] Valid decision receipt artifact exists
[PASS] Valid decision receipt cryptographic proof passes
[PASS] Valid receipt has zero rejected items
[PASS] Refused decision receipt artifact exists
[PASS] Refused decision receipt cryptographic proof passes
[PASS] Refused receipt explicitly blocks execution (action is REFUSE)
[PASS] EpochlineRegistry deployment artifact exists
[PASS] EpochlineRegistry deployed address verified
[PASS] Deployment transaction hash verified on testnet
[PASS] On-chain decision anchor transaction proof exists
[PASS] Anchor transaction hash verified
[PASS] Anchored receipt hash matches record

-------------------------------------------------
Verification Summary: 30/30 checks PASSED.
-------------------------------------------------
>>> ALL AUDIT CHECKS PASSED. GATE C & D VERIFIED. <<<
```

---

## 5. Live Testnet & Deployment Ground Truth

- **Live Application**: [https://epochline.vercel.app](https://epochline.vercel.app)
- **Provenance Lab**: [https://epochline.vercel.app/lab](https://epochline.vercel.app/lab)
- **Proof & Audit Console**: [https://epochline.vercel.app/proof](https://epochline.vercel.app/proof)
- **Somnia Shannon Testnet**: Chain ID `50312` (Block `#485365868`)
- **EpochlineRegistry Contract**: [`0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5`](https://shannon-explorer.somnia.network/address/0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5)
- **Decision Receipt Anchor**: [`0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e`](https://shannon-explorer.somnia.network/tx/0x519aed15d65c54a40a59e9b5149bac1509b83e21529a2d6251ef8440129a725e)
- **Execution Seal Anchor**: [`0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7`](https://shannon-explorer.somnia.network/tx/0xff8004ae6e4c87396e985cb2ef9ae35df937fa70bb5c9f8dc4cdbadb77209bf7)
- **OracleHub Contract**: [`0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b`](https://shannon-explorer.somnia.network/address/0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b)

