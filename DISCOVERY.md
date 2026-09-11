# DISCOVERY.md

# EPOCHLINE Discovery Gate

## 1. Sponsor Primitive

**Primitive:**  
DreamDEX Event Contracts Rolling Binary Markets (`IBinaryModule` & CLOB Order-Book Pool Recycling via `SomniaMarkets`).

**Official evidence:**  
Official DreamDEX Event Contracts documentation & Smart Contracts on Somnia Shannon Testnet:
- Market Structure & Lifecycle: `https://app.dreamdex.io/docs/developers/event-contracts/market-structure`
- Event Contract Gotchas: `https://app.dreamdex.io/docs/developers/event-contracts/gotchas`
- Binary Module Address: `0x3ecC694Cef705358864a646142ac17A90E29e388`
- Direct DreamDEX Token Faucet: `0x89Ebc05dE83aB9752B95030218BB10A542b96B7C`
- TestUSDC Collateral Faucet: `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`

Official documentation explicitly warns:
> "DreamDEX Event Contracts use rolling market windows. Order-book pools are recycled across successive windows. `getCandles` / `getFills` are pool-keyed surfaces that can span many successive markets unless scoped by exact market window."

---

## 2. Observed Constraint

DreamDEX Event Contracts reuse CLOB order-book pool contracts across successive rolling market epochs, while consumer-facing history and analytics surfaces return pool-level state across window boundaries unless strict market-instance (`marketId`) and temporal boundary scoping is enforced.

---

## 3. Live Testnet Evidence

Captured live from Somnia Shannon Testnet (Chain ID 50312) at Block `#484739551`.

### Target Live Market
- **marketId**: `0x0000000000000000000000000000000000000000000000000000000000019262`
- **symbol**: `ETH 60s`
- **asset**: `ETH`
- **intervalSec**: `60`
- **tradingStart**: `1789047180`
- **expiry**: `1789047240`
- **marketAddress**: `0x3ecC694Cef705358864a646142ac17A90E29e388`
- **poolAddress**: `0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f`
- **status**: `Trading` (`1`)
- **venueId**: `0x0000000000000000000000000000000000000000000000000000000000000000`
- **oracleQuestionId**: `0x0000000000000000000000000000000000000000000000000000000000019262`
- **capturedAtBlock**: `484739551`

### Same-Pool Recycled Historical Instances
Pool `0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f` has been recycled across **10 distinct market instances**:

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

### Broad History Result
- **API/surface**: `getFills({ pool: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f" })`
- **Query scope**: Pool-wide (unconstrained by `marketId`)
- **Number of distinct market instances sharing pool**: 10 markets
- **Contamination hazard**: Fills and volume metrics from 9 prior resolved markets (spanning both BTC and ETH) bleed into the active ETH 60s decision context.
- **Evidence file**: `evidence/discovery-probe.json`

### Correctly Scoped Result
- **Query**: `readMarketHistory(identity)` via EPOCHLINE Scope Gate
- **Scoping criteria**: `marketId == 0x00...019262` AND `timestamp ? [1789047180, 1789047240]`
- **Retained rows**: Strictly rows belonging to the active `marketId`
- **Rejected foreign rows**: Formally flagged and rejected with provenance tags
- **Evidence file**: `evidence/discovery-probe.json`

---

## 4. Why Naive Approaches Fail

A naive trading agent or analytics pipeline that treats the CLOB pool contract as the market identity will ingest order-book fills, volume candles, and price marks from prior expired or resolved markets that previously used the same pool.

Because the returned data has valid signatures and looks numerically plausible, standard statistical filters or AI models cannot detect that the signals originate from a different market window or even an entirely different underlying asset. The agent proceeds to execute trades with high confidence on contaminated evidence.

---

## 5. New Capability

**Market-Instance Provenance Firewall & Deterministic Decision Receipts**:
EPOCHLINE encapsulates every market into a canonical `MarketIdentity` capsule, runs an on-chain/indexer temporal `ScopeGate` that refuses out-of-window or cross-market evidence, and produces a cryptographic, replayable `DecisionReceipt` with Keccak-256 evidence hashing before any order execution can occur.

---

## 6. Hard Invariant

> **A decision is VALID only when every piece of market-derived evidence belongs to the exact target canonical `marketId`, matches the registered pool and venue, and lies strictly within the target market's valid temporal window.**

---

## 7. Failure Mode

**The Reused-Pool Contamination Attack**:
Deliberately inject historical trades and candles from previous market `0x00...01925d` (BTC 60s) into the context for active market `0x00...019262` (ETH 60s).
- **Baseline Behavior**: Accepts the mixed rows, generates an artificial momentum signal, and issues a buy order.
- **EPOCHLINE Behavior**: Evaluates provenance, detects `marketId` mismatch, flags offending rows, terminates the pipeline with status `REFUSED`, and blocks execution.

---

## 8. Reproducible Demo

1. **Discover**: Select active testnet market (`0x00...019262`, ETH 60s) and inspect its on-chain state (`Trading`).
2. **Expose**: Inspect pool `0xCb9cE35F...` and reveal the 10 historical market windows recycled on this single pool contract.
3. **Contaminate**: Execute a naive pool-level query and demonstrate foreign-market rows bleeding into the decision context.
4. **Refuse**: Pass the contaminated dataset through the EPOCHLINE `ScopeGate` $\to$ instant `REFUSED: MARKET_PROVENANCE_MISMATCH`.
5. **Cleanse & Receipt**: Filter through canonical `MarketIdentity`, produce a cryptographically signed `DecisionReceipt` with status `VALID`.
6. **Execute & Anchor**: Execute a testnet preflight check, submit a verified order, and anchor the receipt hash on-chain in `EpochlineRegistry.sol`.

---

## 9. Controls

**Random Row-Removal Control**:
To prove that EPOCHLINE's safety does not stem from arbitrary data reduction, we run a control experiment where the exact same number of rows are randomly removed from the pool history without regard to `marketId` or timestamps.
The control dataset continues to suffer from cross-market contamination and fails the provenance gate, demonstrating that only identity-aware scoping resolves the vulnerability.

---

## 10. Unknowns

| Unknown | How it will be resolved |
|---|---|
| Indexer lag relative to on-chain state | EPOCHLINE requires direct on-chain `eth_call` validation (`Trading` status check) during execution preflight. |
| Testnet token faucet liquidity | Verified testnet faucet `0x89Ebc05dE83aB9752B95030218BB10A542b96B7C` and collateral faucet `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E` directly on Somnia Shannon testnet. |
| Future pool recycling cadence | Dynamic resolution of `poolAddress` and `marketId` via `MarketIdentity` without hardcoded assumptions. |

---

## 11. Thesis

> **Because DreamDEX Event Contract order-book pools are recycled across successive rolling market epochs, EPOCHLINE can guarantee provenance safety for autonomous trading agents by making the canonical market instance and its temporal window a strict execution boundary.**
