import Link from "next/link";
import { Shield, ExternalLink, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-surface/80 transition-colors py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs">
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="font-bold text-ink tracking-wider text-sm">EPOCHLINE</span>
            </div>
            <p className="text-muted leading-relaxed max-w-md">
              A deterministic temporal provenance firewall for DreamDEX Event Contracts. Binds trading decisions to one exact market instance and enforces fail-closed execution boundaries before wallet signature.
            </p>
            <div className="text-[11px] text-muted">
              Target Network: <span className="text-ink font-semibold">Somnia Shannon Testnet (Chain ID 50312)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-ink uppercase tracking-wider text-[11px]">Testnet Infrastructure</span>
            <a
              href="https://shannon-explorer.somnia.network/address/0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink flex items-center gap-1 transition-colors"
            >
              <span>EpochlineRegistry</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://shannon-explorer.somnia.network/address/0x3ecC694Cef705358864a646142ac17A90E29e388"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink flex items-center gap-1 transition-colors"
            >
              <span>DreamDEX BinaryModule</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://shannon-explorer.somnia.network/address/0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-ink flex items-center gap-1 transition-colors"
            >
              <span>DreamDEX OracleHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-bold text-ink uppercase tracking-wider text-[11px]">Independent Verification</span>
            <Link href="/lab" className="text-muted hover:text-ink transition-colors">
              Provenance Lab
            </Link>
            <Link href="/proof" className="text-muted hover:text-ink transition-colors">
              Proof & Audit Center
            </Link>
            <div className="mt-2 p-2 rounded border border-line bg-canvas text-[11px] text-muted flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-accent" />
              <code>npm run verify:evidence</code>
            </div>
          </div>
        </div>

        <div className="border-t border-line/70 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-muted">
          <div>
            &copy; {new Date().getFullYear()} EPOCHLINE Protocol. Built for Somnia Shannon Testnet & DreamDEX Event Contracts.
          </div>
          <div className="flex items-center gap-4">
            <span>Settlement: DreamDEX OracleHub</span>
            <span>·</span>
            <span>Invariant: Fail-Closed Temporal Scope</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
