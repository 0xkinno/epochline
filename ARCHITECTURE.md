# ARCHITECTURE.md — EPOCHLINE System Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Somnia Shannon Network
        CLOB[CLOB Recycled Order-Book Pools]
        BM[Binary Module Contract 0x3ecC...]
        REG[EpochlineRegistry.sol]
    end

    subgraph Data Ingestion
        SDK[SomniaMarkets SDK >= 0.28.0]
        RPC[Somnia Testnet RPC / WS]
    end

    subgraph EPOCHLINE Core Engine
        MIC[MarketIdentity Capsule]
        SG[Temporal ScopeGate]
        DRB[Decision Receipt Builder]
        EA[Execution Preflight Adapter]
    end

    subgraph Application & Audit
        UI[Next.js Ash-Grey UI Lab]
        CLI[Independent Evidence Verifier CLI]
    end

    BM --> RPC
    CLOB --> RPC
    RPC --> SDK
    SDK --> MIC
    SDK --> SG
    MIC --> SG
    SG -->|Foreign / Contaminated Rows| REFUSE[REFUSED State]
    SG -->|100% Clean In-Epoch Rows| ACCEPT[VALID State]
    ACCEPT --> DRB
    REFUSE --> DRB
    DRB --> EA
    EA -->|Valid Preflight Check| REG
    DRB --> UI
    DRB --> CLI
```

## Core Modules

### 1. `MarketIdentity` (`src/core/marketIdentity.ts`)
Constructs the canonical identity object containing `marketId`, `symbol`, `venueId`, `asset`, `intervalSec`, `tradingStart`, `expiry`, `marketAddress`, `poolAddress`, and `capturedAtBlock`.

### 2. `ScopeGate` (`src/core/scopeGate.ts`)
Evaluates evidence items against the canonical `MarketIdentity`. Fails closed if any item contains mismatched `marketId`, mismatched `poolAddress`, out-of-window `timestamp`, or missing provenance.

### 3. `HistoryAdapter` (`src/core/historyAdapter.ts`)
Provides the comparative paths:
- `readPoolHistory`: The naive un-scoped pool ingestion path.
- `readMarketHistory`: The safe, identity-gated provenance path.

### 4. `DecisionReceipt` (`src/core/decisionReceipt.ts`)
Computes Keccak-256 evidence hashes, market identity hashes, and policy hashes into a single verifiable receipt.

### 5. `ExecutionAdapter` (`src/core/executionAdapter.ts`)
Preflights execution on-chain by requiring `Trading` status (`1`), valid active time window, and verified receipt before order broadcast.

### 6. `EpochlineRegistry` (`contracts/EpochlineRegistry.sol`)
On-chain attestation registry recording `(marketId, receiptHash, evidenceHash, agent, timestamp)`.
