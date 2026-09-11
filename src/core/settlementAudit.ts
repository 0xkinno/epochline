import { createPublicClient, http, defineChain, type Hex, type PublicClient } from "viem";
import { binaryModuleReadAbi, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import type { DecisionReceipt } from "./decisionReceipt";
import type { ExecutionSeal } from "./executionSeal";

const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network", "https://api.infra.testnet.somnia.network"] },
    public: { http: ["https://dream-rpc.somnia.network", "https://api.infra.testnet.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

const BINARY_MODULE_ADDRESS: `0x${string}` = (SOMNIA_TESTNET_ADDRESSES.binaryModule ?? "0x3ecC694Cef705358864a646142ac17A90E29e388") as `0x${string}`;

export type MarketLifecycleStatus = "Listed" | "Trading" | "Locked" | "Settling" | "Resolved" | "Voided" | "Unknown";

export interface SettlementAuditReport {
  marketId: Hex;
  receiptHash: Hex;
  intentHash: Hex;
  signer: `0x${string}`;
  lifecycleStatus: MarketLifecycleStatus;
  statusCode: number;
  isFinalized: boolean;
  resolution: {
    winningOutcomeId?: bigint;
    winningSide?: "YES" | "NO";
    isVoided: boolean;
    settledAtBlock?: number;
  };
  tradePosition: {
    side: "YES" | "NO" | "BUY_YES" | "BUY_NO";
    amount: number;
    price: number;
  };
  auditSummary: string;
  auditedAt: string;
}

export class SettlementAudit {
  private client: PublicClient;

  constructor(rpcUrl: string = "https://dream-rpc.somnia.network") {
    this.client = createPublicClient({
      chain: somniaTestnet,
      transport: http(rpcUrl),
    });
  }

  /**
   * Links receipt -> execution intent -> on-chain lifecycle status & settlement outcome.
   */
  public async auditSettlement(params: {
    receipt: DecisionReceipt;
    seal: ExecutionSeal;
  }): Promise<SettlementAuditReport> {
    const { receipt, seal } = params;
    const marketId = receipt.market.marketId as Hex;

    let marketData: any;
    try {
      marketData = await this.client.readContract({
        address: BINARY_MODULE_ADDRESS,
        abi: binaryModuleReadAbi,
        functionName: "markets",
        args: [marketId],
      });
    } catch (e: any) {
      // Fallback
    }

    const statusCode = Number(marketData?.status ?? marketData?.[10] ?? 1);
    const statusLabels: MarketLifecycleStatus[] = ["Listed", "Trading", "Locked", "Settling", "Resolved", "Voided"];
    const lifecycleStatus = statusLabels[statusCode] || "Unknown";

    const isFinalized = statusCode === 4 || statusCode === 5;
    const isVoided = statusCode === 5;

    let winningOutcomeId: bigint | undefined = undefined;
    let winningSide: "YES" | "NO" | undefined = undefined;

    if (statusCode === 4 && marketData) {
      winningOutcomeId = marketData.winnerId ?? marketData[8];
      winningSide = winningOutcomeId === 0n ? "YES" : "NO";
    }

    let summary = "";
    if (lifecycleStatus === "Trading") {
      summary = "Market is actively trading. Execution seal is pending resolution.";
    } else if (lifecycleStatus === "Locked" || lifecycleStatus === "Settling") {
      summary = "Market window closed. Oracle resolution in progress.";
    } else if (lifecycleStatus === "Resolved") {
      summary = `Market resolved. Winning outcome: ${winningSide} (ID: ${winningOutcomeId}).`;
    } else if (lifecycleStatus === "Voided") {
      summary = "Market voided. All positions refund at 0.5 collateral value with zero fee.";
    } else {
      summary = `Market lifecycle status: ${lifecycleStatus}.`;
    }

    return {
      marketId,
      receiptHash: receipt.proof.receiptHash,
      intentHash: seal.intentHash,
      signer: seal.intent.signer,
      lifecycleStatus,
      statusCode,
      isFinalized,
      resolution: {
        winningOutcomeId,
        winningSide,
        isVoided,
      },
      tradePosition: {
        side: seal.intent.side,
        amount: seal.intent.amount,
        price: seal.intent.price,
      },
      auditSummary: summary,
      auditedAt: new Date().toISOString(),
    };
  }
}
