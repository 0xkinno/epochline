import { createPublicClient, http, defineChain, type Hex, type PublicClient } from "viem";
import { binaryModuleReadAbi, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import type { DecisionReceipt } from "./decisionReceipt";
import { verifyDecisionReceipt } from "./decisionReceipt";

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

export interface PreflightResult {
  canExecute: boolean;
  reason: string;
  onchainStatus: number;
  onchainStatusLabel: string;
  currentBlockTimestamp: number;
  marketExpiry: number;
  cappedOrderExpiry: number;
}

export class ExecutionAdapter {
  private client: PublicClient;

  constructor(rpcUrl: string = "https://dream-rpc.somnia.network") {
    this.client = createPublicClient({
      chain: somniaTestnet,
      transport: http(rpcUrl),
    });
  }

  public async preflight(receipt: DecisionReceipt): Promise<PreflightResult> {
    if (receipt.state !== "VALID") {
      return {
        canExecute: false,
        reason: `Execution blocked: DecisionReceipt state is '${receipt.state}' (not VALID). Rationale: ${receipt.decision.rationale}`,
        onchainStatus: -1,
        onchainStatusLabel: "N/A",
        currentBlockTimestamp: 0,
        marketExpiry: 0,
        cappedOrderExpiry: 0,
      };
    }

    const receiptVerification = verifyDecisionReceipt(receipt);
    if (!receiptVerification.isValid) {
      return {
        canExecute: false,
        reason: `Execution blocked: Receipt failed cryptographic verification: ${receiptVerification.reasons.join("; ")}`,
        onchainStatus: -1,
        onchainStatusLabel: "N/A",
        currentBlockTimestamp: 0,
        marketExpiry: 0,
        cappedOrderExpiry: 0,
      };
    }

    let marketData: any;
    try {
      marketData = await this.client.readContract({
        address: BINARY_MODULE_ADDRESS,
        abi: binaryModuleReadAbi,
        functionName: "markets",
        args: [receipt.market.marketId as Hex],
      });
    } catch (e: any) {
      return {
        canExecute: false,
        reason: `Execution blocked: Failed to read on-chain market status: ${e.message}`,
        onchainStatus: -1,
        onchainStatusLabel: "ReadError",
        currentBlockTimestamp: 0,
        marketExpiry: 0,
        cappedOrderExpiry: 0,
      };
    }

    const onchainStatus = Number(marketData.status ?? marketData[10] ?? 0);
    const statusLabels = ["Listed", "Trading", "Locked", "Settling", "Resolved", "Voided"];
    const onchainStatusLabel = statusLabels[onchainStatus] || "Unknown";

    if (onchainStatus !== 1) {
      return {
        canExecute: false,
        reason: `Execution blocked: Market status is '${onchainStatusLabel}' (status ${onchainStatus}), but ONLY 'Trading' (status 1) accepts orders.`,
        onchainStatus,
        onchainStatusLabel,
        currentBlockTimestamp: 0,
        marketExpiry: Number(marketData.expiry || marketData[4] || 0),
        cappedOrderExpiry: 0,
      };
    }

    const block = await this.client.getBlock();
    const currentBlockTimestamp = Number(block.timestamp);
    const tradingStart = Number(marketData.tradingStart || marketData[3] || 0);
    const expiry = Number(marketData.expiry || marketData[4] || 0);

    if (currentBlockTimestamp < tradingStart) {
      return {
        canExecute: false,
        reason: `Execution blocked: Market has not opened yet (current ts ${currentBlockTimestamp} < start ${tradingStart}).`,
        onchainStatus,
        onchainStatusLabel,
        currentBlockTimestamp,
        marketExpiry: expiry,
        cappedOrderExpiry: 0,
      };
    }

    if (currentBlockTimestamp >= expiry) {
      return {
        canExecute: false,
        reason: `Execution blocked: Market window has expired (current ts ${currentBlockTimestamp} >= expiry ${expiry}).`,
        onchainStatus,
        onchainStatusLabel,
        currentBlockTimestamp,
        marketExpiry: expiry,
        cappedOrderExpiry: 0,
      };
    }

    const defaultOrderDuration = 300;
    const cappedOrderExpiry = Math.min(currentBlockTimestamp + defaultOrderDuration, expiry);

    return {
      canExecute: true,
      reason: `Preflight passed: Market is actively Trading on-chain, window [${tradingStart}, ${expiry}] is valid, receipt is authentic.`,
      onchainStatus,
      onchainStatusLabel,
      currentBlockTimestamp,
      marketExpiry: expiry,
      cappedOrderExpiry,
    };
  }
}
