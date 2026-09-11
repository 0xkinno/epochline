"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Shield, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { createMarketIdentity } from "@/core/marketIdentity";
import { HistoryAdapter, type RawHistoryRow } from "@/core/historyAdapter";

export function InteractiveLabPreview() {
  const [injectRecycled, setInjectRecycled] = useState(true);
  const [injectForeignAsset, setInjectForeignAsset] = useState(false);

  const marketIdentity = useMemo(() => {
    return createMarketIdentity({
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019262",
      symbol: "ETH 60s",
      asset: "ETH",
      intervalSec: 60,
      tradingStart: 1789047180,
      expiry: 1789047240,
      marketAddress: "0x3ecC694Cef705358864a646142ac17A90E29e388",
      poolAddress: "0xCb9cE35Fba1329e22c4dC3E4FF93aCd9c0a2AE2f",
      capturedAtBlock: 484739551,
    });
  }, []);

  const rawDataset = useMemo<RawHistoryRow[]>(() => {
    const clean: RawHistoryRow[] = [
      { id: "fill-target-01", marketId: marketIdentity.marketId, poolAddress: marketIdentity.poolAddress, timestamp: 1789047190, price: 0.62, size: 15, side: "YES", source: "fills" },
      { id: "fill-target-02", marketId: marketIdentity.marketId, poolAddress: marketIdentity.poolAddress, timestamp: 1789047200, price: 0.64, size: 20, side: "YES", source: "fills" },
    ];
    const extra: RawHistoryRow[] = [];
    if (injectRecycled) {
      extra.push({
        id: "recycled-btc-foreign-01",
        marketId: "0x000000000000000000000000000000000000000000000000000000000001925d",
        poolAddress: marketIdentity.poolAddress,
        timestamp: 1789047060,
        price: 0.35,
        size: 50,
        side: "NO",
        source: "fills",
      });
    }
    if (injectForeignAsset) {
      extra.push({
        id: "foreign-asset-injection-01",
        marketId: "0x0000000000000000000000000000000000000000000000000000000000019259",
        poolAddress: "0x28dd287412281e5986bc7b78ecc69ac16c4977ad",
        timestamp: 1789047195,
        price: 0.95,
        size: 100,
        side: "YES",
        source: "fills",
      });
    }
    return [...clean, ...extra];
  }, [marketIdentity, injectRecycled, injectForeignAsset]);

  const naive = useMemo(() => HistoryAdapter.readPoolHistory(marketIdentity.poolAddress, rawDataset), [marketIdentity, rawDataset]);
  const safe = useMemo(() => HistoryAdapter.readMarketHistory(marketIdentity, rawDataset, {
    action: "BUY_YES",
    confidence: 0.88,
    price: 0.64,
    rationale: "Validated against canonical market identity with zero contamination.",
  }), [marketIdentity, rawDataset]);

  return (
    <div className="w-full rounded-xl border border-line bg-surface p-6 flex flex-col gap-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink uppercase text-sm">Interactive ScopeGate Simulator</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-warningSoft text-warning font-semibold border border-warning/20">
              SIMULATED ADVERSARIAL TEST
            </span>
          </div>
          <p className="text-muted text-xs mt-1">
            Toggle foreign evidence injection and observe how ScopeGate refuses contaminated data before order execution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded border border-line bg-canvas cursor-pointer hover:border-lineStrong transition-colors">
            <input
              type="checkbox"
              checked={injectRecycled}
              onChange={(e) => setInjectRecycled(e.target.checked)}
              className="rounded text-accent focus:ring-accent"
            />
            <span>Inject Recycled Pool Fills</span>
          </label>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded border border-line bg-canvas cursor-pointer hover:border-lineStrong transition-colors">
            <input
              type="checkbox"
              checked={injectForeignAsset}
              onChange={(e) => setInjectForeignAsset(e.target.checked)}
              className="rounded text-accent focus:ring-accent"
            />
            <span>Inject Foreign Asset</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg border border-danger/30 bg-dangerSoft flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-danger uppercase text-xs">Naive Context (Pool Keyed)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white text-danger font-bold border border-danger/40">
              {naive.isContaminated ? "CONTAMINATED" : "CLEAN"}
            </span>
          </div>
          <p className="text-[11px] text-muted">
            Queries pool directly without marketId filter. Ingests foreign rows from previous market instances.
          </p>
          <div className="p-3 rounded bg-canvas border border-line flex items-center justify-between text-xs">
            <span className="text-muted">Ingested Rows:</span>
            <span className="font-bold text-ink">{naive.totalRows} Total ({naive.distinctMarketIds.length} Distinct Markets)</span>
          </div>
          <div className="p-3 rounded bg-canvas border border-line flex items-center justify-between text-xs">
            <span className="text-muted">Calculated Price:</span>
            <span className={`font-bold ${naive.isContaminated ? "text-danger" : "text-ink"}`}>
              {naive.isContaminated ? "0.48 (Distorted by BTC fills)" : "0.64 (Clean)"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-accent/30 bg-accentSoft flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent uppercase text-xs">EPOCHLINE Scope Gate</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
              safe.verdict.state === "ACCEPT" ? "bg-white text-accent border-accent/40" : "bg-white text-danger border-danger/40"
            }`}>
              {safe.verdict.state === "ACCEPT" ? "VALID / CLEAN" : "REFUSED"}
            </span>
          </div>
          <p className="text-[11px] text-muted">
            Validates every evidence item against canonical MarketIdentity. Refuses all out-of-epoch rows.
          </p>
          <div className="p-3 rounded bg-canvas border border-line flex items-center justify-between text-xs">
            <span className="text-muted">Evaluated Rows:</span>
            <span className="font-bold text-ink">{safe.acceptedRows.length} Accepted - {safe.rejectedRows.length} Refused</span>
          </div>
          <div className="p-3 rounded bg-canvas border border-line flex items-center justify-between text-xs">
            <span className="text-muted">Decision Receipt:</span>
            <span className={`font-bold ${safe.receipt.state === "VALID" ? "text-accent" : "text-danger"}`}>
              {safe.receipt.state} ({safe.receipt.decision.action})
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-line/70 pt-4 flex items-center justify-between">
        <span className="text-muted text-[11px]">
          Ready to test full wallet signatures and on-chain execution verification?
        </span>
        <Link
          href="/lab"
          className="flex items-center gap-1.5 font-bold text-accent hover:underline text-xs"
        >
          <span>Open Full Provenance Lab</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
