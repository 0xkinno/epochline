# DECISIONS.md — Architecture & Design Decisions

## Decision 1: Market-Instance Provenance as the Primary Capability
- **Context**: Rolling DreamDEX binary markets recycle order-book pool contracts across successive windows.
- **Decision**: Treat the canonical `marketId` + valid temporal interval as an impenetrable execution boundary, refusing foreign or out-of-window data rather than attempting to filter silently.
- **Rationale**: Silent filtering hides data corruption. Refusing contaminated execution forces agents to operate only on verified ground truth.

## Decision 2: Deterministic Scope Gate over LLM Heuristics
- **Context**: AI models can generate plausible explanations from contaminated data without detecting temporal anomalies.
- **Decision**: AI may propose decisions, but deterministic TypeScript / Solidity code enforces the `ScopeGate` and generates cryptographic receipts.
- **Rationale**: Cryptographic proofs and deterministic invariants are independently verifiable by any auditor.

## Decision 3: Fail-Closed Provenance Model
- **Context**: Missing or partial metadata on historical fills.
- **Decision**: Any evidence item lacking a verifiable `marketId` or carrying an out-of-window timestamp triggers immediate status `REJECT`.
- **Rationale**: In automated high-frequency trading, missing provenance is indistinguishable from malicious injection.

## Decision 4: Pure Ash-Grey Institutional Aesthetic
- **Context**: Financial infrastructure vs generic crypto SaaS.
- **Decision**: Use an ash-grey palette (`#F2F1ED`, `#FAF9F6`, `#11110F`, `#1D6B55`) with high-density comparative tables, disciplined data traces, and IBM Plex Mono typography.
- **Rationale**: Enhances clarity, readability, and professional rigor for judges and quantitative developers.
