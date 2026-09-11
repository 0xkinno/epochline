"use client";

import { useState } from "react";
import { Database, ShieldCheck, FileCheck, Lock, KeyRound, CheckCircle2, ChevronRight } from "lucide-react";

export function ProofChain() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "01",
      name: "Evidence Stream",
      icon: Database,
      tag: "Raw Order Flow",
      description: "Ingests raw candidate fills, trades, and orderbook updates from the target pool address.",
      details: "Raw data includes candidate fills from the pool. Without filtering, rows from prior rolling markets pollute the dataset.",
      hashType: "Evidence Hash (H_E)",
      formula: "H_E = Keccak256(Canonicalize(E_accepted))",
    },
    {
      id: "02",
      name: "MarketIdentity",
      icon: ShieldCheck,
      tag: "Canonical Capsule",
      description: "Encapsulates canonical marketId, venue, pool, and trading window [start, expiry].",
      details: "Binds execution explicitly to the exact market instance, distinguishing it from 9 previous markets sharing the same recycled pool.",
      hashType: "Market Identity Hash (H_M)",
      formula: "H_M = Keccak256(Canonicalize(MarketIdentity))",
    },
    {
      id: "03",
      name: "ScopeGate Firewall",
      icon: Lock,
      tag: "Fail-Closed Invariant",
      description: "Rejects all items where marketId != target or timestamp is out of the active window.",
      details: "Guarantees |E_offending| == 0. If any foreign fill is detected, the entire decision context is formally refused.",
      hashType: "Policy Hash (H_P)",
      formula: "H_P = Keccak256('EPOCHLINE_POLICY_market-instance-v1')",
    },
    {
      id: "04",
      name: "Decision Receipt",
      icon: FileCheck,
      tag: "Cryptographic Attestation",
      description: "Generates a deterministic Keccak-256 receipt containing the decision, evidence hash, and policy.",
      details: "The receipt can be independently replayed and validated by any third party verifier before order authorization.",
      hashType: "Receipt Hash (H_R)",
      formula: "H_R = Keccak256(Canonicalize({ Protocol, State, Market, H_E, H_M, H_P }))",
    },
    {
      id: "05",
      name: "Execution Seal",
      icon: KeyRound,
      tag: "Wallet Intent Binding",
      description: "Binds receiptHash + marketId + signer + order parameters into an immutable intentHash.",
      details: "The user signs the intentHash. DreamDEX order execution is locked to the validated receipt.",
      hashType: "Intent Hash (H_I)",
      formula: "H_I = Keccak256({ receiptHash, marketId, pool, signer, side, amount, price })",
    },
    {
      id: "06",
      name: "On-Chain Settlement",
      icon: CheckCircle2,
      tag: "Registry & OracleHub",
      description: "Anchors receipt hash on EpochlineRegistry and audits outcome via DreamDEX OracleHub.",
      details: "Execution lineage is permanently queryable on Somnia Shannon testnet (Contract: 0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5).",
      hashType: "Settlement Audit",
      formula: "Audit = Linkage(Receipt -> Intent -> Tx -> Anchor -> Settlement)",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                isActive
                  ? "border-accent bg-accentSoft shadow-sm"
                  : "border-line bg-surface hover:border-lineStrong"
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className={isActive ? "text-accent font-bold" : "text-muted"}>{step.id}</span>
                <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted"}`} />
              </div>
              <div className="text-xs font-bold text-ink truncate">{step.name}</div>
              <div className="text-[10px] text-muted truncate">{step.tag}</div>
            </button>
          );
        })}
      </div>

      <div className="p-6 rounded-xl border border-line bg-surface flex flex-col md:flex-row items-start justify-between gap-6 glow-accent">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-accentSoft text-accent font-bold border border-accent/20">
              STAGE {steps[activeStep].id}
            </span>
            <span className="text-muted uppercase text-[11px]">{steps[activeStep].tag}</span>
          </div>

          <h4 className="text-lg font-bold text-ink">{steps[activeStep].name}</h4>
          <p className="text-xs text-muted leading-relaxed">{steps[activeStep].description}</p>
          <div className="p-3 rounded border border-line bg-canvas text-xs text-ink">
            {steps[activeStep].details}
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[11px] text-muted uppercase">Cryptographic Formula</div>
            <div className="text-xs font-semibold text-accent mt-1 p-2 rounded bg-canvas border border-line break-all">
              {steps[activeStep].formula}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-muted uppercase">Artifact Type</div>
            <div className="text-xs font-semibold text-ink mt-1">{steps[activeStep].hashType}</div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveStep((activeStep + 1) % steps.length)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded bg-surface2 border border-line hover:border-lineStrong text-xs font-bold text-ink transition-colors"
            >
              <span>Next Stage ({steps[(activeStep + 1) % steps.length].name})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
