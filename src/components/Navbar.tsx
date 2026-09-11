"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Shield, Wallet, Power, Menu, X, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const SHANNON_CHAIN_ID = 50312;
const SHANNON_HEX = "0xc488";

export function Navbar() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
        }
      }).catch(() => {});

      eth.request({ method: "eth_chainId" }).then((hexId: string) => {
        setChainId(parseInt(hexId, 16));
      }).catch(() => {});

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      };

      const handleChainChanged = (hexId: string) => {
        setChainId(parseInt(hexId, 16));
      };

      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);

      return () => {
        if (eth.removeListener) {
          eth.removeListener("accountsChanged", handleAccountsChanged);
          eth.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
        }
        const currentChainId = await (window as any).ethereum.request({ method: "eth_chainId" });
        const parsed = parseInt(currentChainId, 16);
        setChainId(parsed);

        if (parsed !== SHANNON_CHAIN_ID) {
          await handleSwitchToShannon();
        }
      } catch (e: any) {
        console.warn("Wallet connection error:", e.message);
      }
    } else {
      alert("No Web3 wallet detected. Please install MetaMask or Rabby to sign transactions on Somnia Shannon Testnet.");
    }
    setIsConnecting(false);
  };

  const handleSwitchToShannon = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SHANNON_HEX }],
        });
        setChainId(SHANNON_CHAIN_ID);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: SHANNON_HEX,
                  chainName: "Somnia Shannon Testnet",
                  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
                  rpcUrls: ["https://dream-rpc.somnia.network", "https://api.infra.testnet.somnia.network"],
                  blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
                },
              ],
            });
            setChainId(SHANNON_CHAIN_ID);
          } catch (addError) {
            console.error("Failed to add Somnia Shannon Testnet:", addError);
          }
        }
      }
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setChainId(null);
  };

  const navLinks = [
    { label: "Overview", href: "/" },
    { label: "Provenance Lab", href: "/lab" },
    { label: "Proof & Audit", href: "/proof" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-line bg-canvas group-hover:border-accent transition-colors">
              <Shield className="h-4 w-4 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-ink">EPOCHLINE</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Provenance Firewall</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-mono text-xs transition-colors py-1 ${
                    isActive
                      ? "text-ink font-bold border-b-2 border-accent"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          {walletAddress && chainId !== null ? (
            chainId === SHANNON_CHAIN_ID ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-accent/30 bg-accentSoft font-mono text-[11px] text-accent font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span>Shannon (50312)</span>
              </div>
            ) : (
              <button
                onClick={handleSwitchToShannon}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-warning/40 bg-warningSoft font-mono text-[11px] text-warning font-semibold hover:opacity-90"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>Switch to Shannon</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-line bg-canvas font-mono text-[11px] text-muted">
              <span className="flex h-1.5 w-1.5 rounded-full bg-muted" />
              <span>Shannon Testnet (50312)</span>
            </div>
          )}

          {walletAddress ? (
            <div className="flex items-center gap-1.5 bg-surface border border-line rounded p-1 font-mono text-xs">
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-ink font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
              <button
                onClick={handleDisconnectWallet}
                title="Disconnect wallet"
                aria-label="Disconnect wallet"
                className="p-1 rounded hover:bg-dangerSoft text-muted hover:text-danger transition-colors"
              >
                <Power className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs font-semibold bg-ink text-white hover:opacity-90 transition-opacity"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 rounded border border-line bg-surface text-ink"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-line bg-surface p-4 flex flex-col gap-4 font-mono text-xs animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded ${
                  pathname === link.href ? "bg-surface2 font-bold text-ink" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-line pt-4 flex flex-col gap-3">
            {walletAddress ? (
              <div className="flex items-center justify-between p-2 rounded bg-surface2 border border-line">
                <span className="font-semibold text-ink">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button
                  onClick={handleDisconnectWallet}
                  className="flex items-center gap-1 text-danger font-semibold"
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-bold bg-ink text-white"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
