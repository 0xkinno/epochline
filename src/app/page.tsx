import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Lock,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  ExternalLink,
  Terminal,
  Layers,
  KeyRound,
  Cpu,
} from "lucide-react";
import { InteractiveLabPreview } from "@/components/InteractiveLabPreview";
import { ProofChain } from "@/components/ProofChain";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION WITH EXPANDED BACKGROUND ARTWORK */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-line">
        {/* Background Artwork Behind Content */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/hero.jpg"
            alt="EPOCHLINE Architectural Provenance"
            fill
            priority
            className="object-cover object-center opacity-35 dark:opacity-25 filter contrast-125 scale-105"
          />
          {/* High-Contrast Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-canvas/90 to-canvas" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-canvas/70 to-canvas" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl text-center flex flex-col items-center gap-8">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface/80 backdrop-blur-md font-mono text-[11px] text-muted">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-semibold text-ink">SOMNIA SHANNON TESTNET (50312)</span>
            <span>·</span>
            <span>DREAMDEX EVENT CONTRACTS</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-sans leading-[1.1] max-w-4xl">
            YOUR TRADING AGENT CAN BE <span className="text-accent">RIGHT ABOUT THE MARKET</span> AND WRONG ABOUT THE EVIDENCE.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-muted font-sans max-w-2xl leading-relaxed">
            EPOCHLINE is a provenance firewall for DreamDEX Event Contracts. It binds trading decisions to one exact market instance and refuses contaminated evidence before wallet-authorized execution.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 font-mono text-xs">
            <Link
              href="/lab"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-ink text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch Provenance Lab</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/proof"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-surface border border-line hover:border-lineStrong text-ink font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Inspect Proof Center</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted" />
            </Link>
          </div>

          {/* Key Discovery Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-8 border-t border-line/60 font-mono text-left">
            <div className="p-3.5 rounded-lg border border-line bg-surface/80 backdrop-blur-sm">
              <div className="text-muted text-[10px] uppercase">Recycled Pools</div>
              <div className="text-xl font-bold text-ink mt-0.5">18 Anomaly Pools</div>
              <div className="text-[10px] text-muted mt-1">Shared across 100 markets</div>
            </div>

            <div className="p-3.5 rounded-lg border border-line bg-surface/80 backdrop-blur-sm">
              <div className="text-muted text-[10px] uppercase">ScopeGate Firewall</div>
              <div className="text-xl font-bold text-accent mt-0.5">100% Fail-Closed</div>
              <div className="text-[10px] text-muted mt-1">Foreign fills refused</div>
            </div>

            <div className="p-3.5 rounded-lg border border-line bg-surface/80 backdrop-blur-sm">
              <div className="text-muted text-[10px] uppercase">Execution Invariant</div>
              <div className="text-xl font-bold text-ink mt-0.5">0 Offending Rows</div>
              <div className="text-[10px] text-muted mt-1">Receipt-to-intent seal</div>
            </div>

            <div className="p-3.5 rounded-lg border border-line bg-surface/80 backdrop-blur-sm">
              <div className="text-muted text-[10px] uppercase">Testnet Attestation</div>
              <div className="text-xl font-bold text-proof mt-0.5">Live Anchored</div>
              <div className="text-[10px] text-muted mt-1">Block #485365853</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 02: THE CONTAMINATION FAILURE VISUALIZED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold text-danger uppercase tracking-wider">01. The Problem</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-sans">
            Why querying the pool is not querying the market
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            DreamDEX Event Contracts recycle liquidity pools across successive rolling trading windows. A naive bot querying pool history unknowingly consumes trades from past expired markets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          {/* Naive Path */}
          <div className="p-6 rounded-xl border border-danger/30 bg-dangerSoft flex flex-col gap-4 glow-danger">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-danger" />
                <span className="font-bold text-danger uppercase">Naive Pool Query (Vulnerable)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white text-danger font-bold text-[10px] border border-danger/30">
                50% CONTAMINATION
              </span>
            </div>

            <div className="p-4 rounded bg-canvas border border-line flex flex-col gap-2">
              <div className="text-muted text-[11px]">POOL 0xCb9c...AE2f (Shared by 10 Rolling Markets)</div>
              <div className="p-2 rounded bg-surface border border-line text-muted">
                Market A (ETH 60s) - Fill #1: BUY YES @ 0.64 (In-Epoch)
              </div>
              <div className="p-2 rounded bg-dangerSoft border border-danger/30 text-danger font-semibold">
                Market B (BTC 60s Expired) - Fill #2: BUY NO @ 0.35 (Foreign)
              </div>
              <div className="p-2 rounded bg-dangerSoft border border-danger/30 text-danger font-semibold">
                Market C (ETH 300s Expired) - Fill #3: BUY NO @ 0.48 (Foreign)
              </div>
            </div>

            <div className="border-t border-danger/20 pt-3 flex items-center justify-between">
              <span className="text-muted">Calculated Momentum Signal:</span>
              <span className="font-bold text-danger">0.48 Distorted Price (Fails Trade)</span>
            </div>
          </div>

          {/* EPOCHLINE Path */}
          <div className="p-6 rounded-xl border border-accent/30 bg-accentSoft flex flex-col gap-4 glow-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <span className="font-bold text-accent uppercase">EPOCHLINE ScopeGate (Protected)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white text-accent font-bold text-[10px] border border-accent/30">
                0% CONTAMINATION
              </span>
            </div>

            <div className="p-4 rounded bg-canvas border border-line flex flex-col gap-2">
              <div className="text-muted text-[11px]">CANONICAL MARKET CAPSULE 0x00...019262</div>
              <div className="p-2 rounded bg-accentSoft border border-accent/30 text-accent font-semibold flex items-center justify-between">
                <span>Market A - Fill #1: BUY YES @ 0.64</span>
                <span className="text-[10px]">ACCEPTED (IN-EPOCH)</span>
              </div>
              <div className="p-2 rounded bg-surface border border-line text-muted line-through flex items-center justify-between">
                <span>Market B - Fill #2: BUY NO @ 0.35</span>
                <span className="text-danger font-bold text-[10px]">REFUSED (MARKET_MISMATCH)</span>
              </div>
              <div className="p-2 rounded bg-surface border border-line text-muted line-through flex items-center justify-between">
                <span>Market C - Fill #3: BUY NO @ 0.48</span>
                <span className="text-danger font-bold text-[10px]">REFUSED (TEMPORAL_OUT_OF_BOUNDS)</span>
              </div>
            </div>

            <div className="border-t border-accent/20 pt-3 flex items-center justify-between">
              <span className="text-muted">Verified Clean Signal:</span>
              <span className="font-bold text-accent">0.64 True Price (Order Authorized)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 03: CORE MECHANISM CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">02. Core Mechanism</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-sans">
            Four cryptographic layers of execution defense
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
          {/* Card 1 */}
          <div className="p-6 rounded-xl border border-line bg-surface flex flex-col gap-3 glow-accent">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-accent">LAYER 01</span>
              <Layers className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-sm font-bold text-ink">Market Identity Capsule</h3>
            <p className="text-muted leading-relaxed">
              Canonical binding of marketId, venue, pool address, and trading timestamps into an immutable hash.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl border border-line bg-surface flex flex-col gap-3 glow-danger">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-danger">LAYER 02</span>
              <Lock className="h-4 w-4 text-danger" />
            </div>
            <h3 className="text-sm font-bold text-ink">Fail-Closed ScopeGate</h3>
            <p className="text-muted leading-relaxed">
              Deterministic validation verifying zero foreign items. Rejects context if even a single un-scoped row is detected.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl border border-line bg-surface flex flex-col gap-3 glow-proof">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-proof">LAYER 03</span>
              <KeyRound className="h-4 w-4 text-proof" />
            </div>
            <h3 className="text-sm font-bold text-ink">Execution Seal Intent</h3>
            <p className="text-muted leading-relaxed">
              Two-phase lock binding receipt hash, signer, and order parameters so unverified context cannot be signed.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-xl border border-line bg-surface flex flex-col gap-3 glow-warning">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-warning">LAYER 04</span>
              <FileCheck className="h-4 w-4 text-warning" />
            </div>
            <h3 className="text-sm font-bold text-ink">On-Chain Attestation</h3>
            <p className="text-muted leading-relaxed">
              Permanent event emissions on EpochlineRegistry and settlement audit via DreamDEX OracleHub.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION 04: INTERACTIVE LAB PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold text-accent uppercase tracking-wider">03. Interactive Verification</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-sans">
            Test the ScopeGate firewall in real-time
          </h2>
        </div>
        <InteractiveLabPreview />
      </section>

      {/* 5. SECTION 05: THE PROOF CHAIN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold text-proof uppercase tracking-wider">04. End-to-End Pipeline</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-sans">
            From raw order flow to settlement audit
          </h2>
        </div>
        <ProofChain />
      </section>

      {/* 6. SECTION 06: ORACLE & SETTLEMENT TRANSPARENCY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-xl border border-line bg-surface flex flex-col md:flex-row items-start justify-between gap-8 font-mono text-xs">
          <div className="flex-1 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accentSoft text-accent font-bold w-fit">
              <span>SETTLEMENT TRANSPARENCY</span>
            </div>
            <h3 className="text-xl font-bold text-ink font-sans">
              DreamDEX OracleHub settles the market. EPOCHLINE verifies the context.
            </h3>
            <p className="text-muted leading-relaxed">
              EPOCHLINE is not a prediction market or an oracle provider. DreamDEX settles Event Contracts via its deployed OracleHub contract (<code className="font-bold text-ink">0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b</code>). EPOCHLINE ensures that automated decisions are executed solely against clean, non-contaminated historical context.
            </p>
          </div>

          <div className="w-full md:w-80 p-4 rounded-lg border border-line bg-canvas flex flex-col gap-3">
            <div className="text-[11px] text-muted">ORACLEHUB REFERENCE</div>
            <div className="text-xs font-semibold text-ink break-all">
              0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b
            </div>
            <a
              href="https://shannon-explorer.somnia.network/address/0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent font-semibold hover:underline mt-2"
            >
              <span>View OracleHub on Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* 7. SECTION 07: FINAL EDITORIAL CTA */}
      <section className="mx-auto max-w-5xl px-4 text-center flex flex-col items-center gap-6 py-12">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink font-sans">
          Do not trust the context. <span className="text-accent">Verify it.</span>
        </h2>
        <p className="text-muted font-sans text-sm max-w-xl">
          Enter the Provenance Lab to explore live market instances, inject adversarial noise, and execute proof-carrying orders on Somnia Shannon Testnet.
        </p>
        <Link
          href="/lab"
          className="px-8 py-3.5 rounded-lg bg-ink text-white font-mono text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <span>Enter Provenance Lab</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
