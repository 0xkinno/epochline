"use client";

import { X, ExternalLink, ShieldCheck, Database, Clock, Lock } from "lucide-react";

export interface MarketDetailProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    marketId: string;
    symbol: string;
    asset: string;
    intervalSec: number;
    tradingStart: number;
    expiry: number;
    poolAddress: string;
    marketAddress: string;
    status: string;
    recycledEpochsCount: number;
    oracleQuestionId?: string;
  };
}

export function MarketDetailDrawer({ isOpen, onClose, market }: MarketDetailProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl border border-line bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-mono text-xs">
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-accent animate-pulse" />
            <h3 className="text-sm font-bold text-ink">{market.symbol} - Canonical Market Identity Capsule</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface2 text-muted hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="p-3 rounded-lg border border-accent/20 bg-accentSoft">
            <div className="text-[11px] font-bold text-accent uppercase">Provenance Invariant</div>
            <p className="text-ink text-xs mt-1 leading-relaxed">
              Every decision receipt is cryptographically bound to this exact tuple. Orders attempting execution on recycled pool <span className="font-bold text-ink">{market.poolAddress}</span> without matching this exact marketId will be rejected by ScopeGate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded border border-line bg-canvas">
              <div className="text-muted text-[11px]">CANONICAL MARKET ID</div>
              <div className="font-semibold text-ink break-all mt-1">{market.marketId}</div>
            </div>

            <div className="p-3 rounded border border-line bg-canvas">
              <div className="text-muted text-[11px]">RECYCLED POOL ADDRESS</div>
              <div className="font-semibold text-ink break-all mt-1">{market.poolAddress}</div>
            </div>

            <div className="p-3 rounded border border-line bg-canvas">
              <div className="text-muted text-[11px]">EVENT CONTRACT VENUE</div>
              <div className="font-semibold text-ink break-all mt-1">{market.marketAddress}</div>
            </div>

            <div className="p-3 rounded border border-line bg-canvas">
              <div className="text-muted text-[11px]">ON-CHAIN LIFECYCLE STATUS</div>
              <div className="font-bold text-accent mt-1">{market.status} (Code 1: Trading)</div>
            </div>

            <div className="p-3 rounded border border-line bg-canvas">
              <div className="text-muted text-[11px]">TEMPORAL WINDOW</div>
              <div className="font-semibold text-ink mt-1">
                {market.tradingStart} to {market.expiry} ({market.intervalSec}s)
              </div>
            </div>

            <div className="p-3 rounded border border-line bg-canvas">
              <div className="text-muted text-[11px]">POOL RECYCLING CADENCE</div>
              <div className="font-semibold text-warning mt-1">
                {market.recycledEpochsCount} Successive Markets on Pool
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-line bg-surface2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink uppercase">Settlement Oracle Architecture</span>
              <span className="text-[11px] text-muted">DreamDEX OracleHub</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              DreamDEX settles Event Contracts via OracleHub on Somnia Shannon. EPOCHLINE verifies pre-execution evidence provenance, while OracleHub provides the post-expiry price resolution.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-line/50 text-[11px]">
              <span>OracleHub Contract:</span>
              <span className="font-semibold text-ink">0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b</span>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-4 mt-4 flex items-center justify-between">
          <a
            href={`https://shannon-explorer.somnia.network/address/${market.poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <span>View Pool on Shannon Explorer</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-bold bg-ink text-white hover:opacity-90 transition-opacity"
          >
            Close Capsule
          </button>
        </div>
      </div>
    </div>
  );
}
