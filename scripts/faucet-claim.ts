import { createWalletClient, createPublicClient, http, defineChain, parseUnits, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const FAUCET_CONTRACT = "0x89Ebc05dE83aB9752B95030218BB10A542b96B7C";
const TEST_USDC_FAUCET = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

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
  console.log("=== DREAMDEX TESTNET FAUCET CLAIM HELPER ===");

  const pk = process.env.PRIVATE_KEY;
  if (!pk || pk === "0x..." || !pk.startsWith("0x")) {
    console.error("[ERROR] Set PRIVATE_KEY in .env.local to claim from faucets.");
    process.exit(1);
  }

  const account = privateKeyToAccount(pk as Hex);
  console.log(`Beneficiary Address: ${account.address}`);

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
  console.log(`Native STT Balance: ${Number(balance) / 1e18} STT`);

  console.log("\n1. Claiming TestUSDC Collateral from Faucet (0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E)...");
  try {
    const hash = await walletClient.writeContract({
      address: TEST_USDC_FAUCET,
      abi: [
        {
          name: "faucet",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "amount", type: "uint256" }],
          outputs: [],
        },
      ],
      functionName: "faucet",
      args: [parseUnits("10000", 6)], // 10,000 tUSDC
    });
    console.log(`TestUSDC Faucet Tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`TestUSDC Faucet Confirmed in block ${receipt.blockNumber}!`);
  } catch (e: any) {
    console.log(`TestUSDC Faucet note: ${e.message}`);
  }

  console.log("\n2. Checking Direct DreamDEX Token Faucet (0x89Ebc05dE83aB9752B95030218BB10A542b96B7C)...");
  try {
    const hash = await walletClient.sendTransaction({
      to: FAUCET_CONTRACT,
      value: 0n,
      data: "0x89b4d5a1", // standard drip selector or fallback
    });
    console.log(`Direct Token Faucet Tx: ${hash}`);
  } catch (e: any) {
    console.log(`Direct Token Faucet note: ${e.message}`);
  }

  console.log("\n=== FAUCET PROCESS COMPLETE ===");
}

main().catch(console.error);
