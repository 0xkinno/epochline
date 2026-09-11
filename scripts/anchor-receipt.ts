import { createWalletClient, createPublicClient, http, defineChain, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import type { DecisionReceipt } from "../src/core/decisionReceipt";
import { createExecutionSeal } from "../src/core/executionSeal";
import { ExecutionAdapter } from "../src/core/executionAdapter";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL || "https://dream-rpc.somnia.network"] },
    public: { http: [process.env.RPC_URL || "https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

async function main() {
  console.log("=== ANCHORING DECISION RECEIPT & EXECUTION SEAL ON-CHAIN ===");

  const deploymentsPath = path.join(process.cwd(), "contracts/deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("deployments.json not found. Deploy EpochlineRegistry first.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  const registryAddress = deployment.address as Hex;

  const receiptPath = path.join(process.cwd(), "evidence/receipts/decision-receipt-valid.json");
  if (!fs.existsSync(receiptPath)) {
    throw new Error("decision-receipt-valid.json not found. Run 'npm run control:run' first.");
  }

  const receipt: DecisionReceipt = JSON.parse(fs.readFileSync(receiptPath, "utf-8"));

  const pk = process.env.PRIVATE_KEY;
  if (!pk || pk === "0x..." || !pk.startsWith("0x")) {
    console.error("\n[ERROR] PRIVATE_KEY is missing in .env.local.");
    process.exit(1);
  }

  const account = privateKeyToAccount(pk as Hex);
  console.log(`Agent Signer: ${account.address}`);

  // Create Execution Seal
  const seal = createExecutionSeal({
    receipt,
    signer: account.address,
    side: "BUY_YES",
    amount: 10,
    price: 0.64,
    orderExpiry: Number(receipt.market.expiry),
  });

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(process.env.RPC_URL || "https://dream-rpc.somnia.network"),
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http(process.env.RPC_URL || "https://dream-rpc.somnia.network"),
  });

  const artifact = JSON.parse(fs.readFileSync(path.join(process.cwd(), "contracts/EpochlineRegistry.json"), "utf-8"));

  // 1. Anchor Decision Receipt
  console.log("\n1. Broadcasting anchorDecision transaction...");
  const hash1 = await walletClient.writeContract({
    address: registryAddress,
    abi: artifact.abi,
    functionName: "anchorDecision",
    args: [
      receipt.market.marketId as Hex,
      receipt.proof.receiptHash as Hex,
      receipt.proof.evidenceHash as Hex,
    ],
  });

  console.log(`Decision Anchor Tx Hash: ${hash1}`);
  const txReceipt1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log(`Decision Anchor Confirmed in Block #${txReceipt1.blockNumber}!`);

  const decisionAnchorRecord = {
    network: "Somnia Shannon Testnet",
    chainId: 50312,
    registryAddress,
    marketId: receipt.market.marketId,
    receiptHash: receipt.proof.receiptHash,
    evidenceHash: receipt.proof.evidenceHash,
    transactionHash: hash1,
    blockNumber: Number(txReceipt1.blockNumber),
    gasUsed: txReceipt1.gasUsed.toString(),
    agent: account.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(process.cwd(), "evidence/tx/anchor-receipt-tx.json"),
    JSON.stringify(decisionAnchorRecord, null, 2)
  );

  // 2. Anchor Execution Seal (Proof of Execution Binding)
  console.log("\n2. Broadcasting anchorExecution transaction (Proof of Execution Binding)...");
  const executionHash = seal.intentHash; // Deterministic execution hash
  const hash2 = await walletClient.writeContract({
    address: registryAddress,
    abi: artifact.abi,
    functionName: "anchorExecution",
    args: [
      receipt.market.marketId as Hex,
      receipt.proof.receiptHash as Hex,
      seal.intentHash as Hex,
      executionHash as Hex,
    ],
  });

  console.log(`Execution Anchor Tx Hash: ${hash2}`);
  const txReceipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log(`Execution Anchor Confirmed in Block #${txReceipt2.blockNumber}!`);

  const executionAnchorRecord = {
    network: "Somnia Shannon Testnet",
    chainId: 50312,
    registryAddress,
    marketId: receipt.market.marketId,
    receiptHash: receipt.proof.receiptHash,
    intentHash: seal.intentHash,
    executionHash,
    transactionHash: hash2,
    blockNumber: Number(txReceipt2.blockNumber),
    gasUsed: txReceipt2.gasUsed.toString(),
    signer: account.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(process.cwd(), "evidence/tx/anchor-execution-tx.json"),
    JSON.stringify(executionAnchorRecord, null, 2)
  );

  console.log(`\n======================================================`);
  console.log(`[SUCCESS] Full Proof-Carrying Execution Chain Anchored!`);
  console.log(`Registry: ${registryAddress}`);
  console.log(`Decision Anchor Tx: https://shannon-explorer.somnia.network/tx/${hash1}`);
  console.log(`Execution Seal Tx: https://shannon-explorer.somnia.network/tx/${hash2}`);
  console.log(`======================================================\n`);
}

main().catch((e) => {
  console.error("Anchor failed:", e);
  process.exit(1);
});
