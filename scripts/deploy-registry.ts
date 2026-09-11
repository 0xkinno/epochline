import { createWalletClient, createPublicClient, http, defineChain, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local first, then .env
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
  console.log("=== DEPLOYING EPOCHLINE REGISTRY TO SOMNIA SHANNON TESTNET ===");

  const pk = process.env.PRIVATE_KEY;
  if (!pk || pk === "0x..." || !pk.startsWith("0x")) {
    console.error("\n[ERROR] PRIVATE_KEY is missing or invalid in .env.local.");
    console.error("Please add your funded Somnia Shannon testnet private key to .env.local:\n");
    console.error("PRIVATE_KEY=0x<your-private-key>\n");
    process.exit(1);
  }

  const account = privateKeyToAccount(pk as Hex);
  console.log(`Deployer Account: ${account.address}`);

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(process.env.RPC_URL || "https://dream-rpc.somnia.network"),
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http(process.env.RPC_URL || "https://dream-rpc.somnia.network"),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Account Balance: ${Number(balance) / 1e18} STT`);

  if (balance === 0n) {
    console.warn("[WARNING] Account balance is 0 STT. Please fund this wallet from the Somnia testnet faucet.");
  }

  const artifactPath = path.join(process.cwd(), "contracts/EpochlineRegistry.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("EpochlineRegistry.json not found. Run 'tsx scripts/compile.ts' first.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  console.log("Broadcasting deployment transaction...");
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode as Hex,
  });

  console.log(`Deployment Tx Hash: ${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  if (!contractAddress) {
    throw new Error("Contract address was not returned in receipt!");
  }

  console.log(`\n======================================================`);
  console.log(`[SUCCESS] EpochlineRegistry deployed at: ${contractAddress}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Gas Used: ${receipt.gasUsed}`);
  console.log(`Explorer Link: https://shannon-explorer.somnia.network/tx/${hash}`);
  console.log(`======================================================\n`);

  const deploymentInfo = {
    network: "Somnia Shannon Testnet",
    chainId: 50312,
    contractName: "EpochlineRegistry",
    address: contractAddress,
    transactionHash: hash,
    blockNumber: Number(receipt.blockNumber),
    gasUsed: receipt.gasUsed.toString(),
    deployer: account.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(process.cwd(), "contracts/deployments.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  fs.writeFileSync(
    path.join(process.cwd(), "evidence/tx/deployment-receipt.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Saved deployment records to contracts/deployments.json and evidence/tx/deployment-receipt.json");
}

main().catch((e) => {
  console.error("Deployment failed:", e);
  process.exit(1);
});
