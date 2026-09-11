import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES, binaryModuleReadAbi } from "@somnia-chain/markets-sdk";
import { createPublicClient, http, defineChain } from "viem";
import * as fs from "fs";
import * as path from "path";

const RPC_URL = process.env.RPC_URL || "https://dream-rpc.somnia.network";
const WS_RPC_URL = process.env.WS_RPC_URL || "wss://api.infra.testnet.somnia.network/ws";
const INDEXER_URL = process.env.INDEXER_URL || "https://dev.smk.somnia.host/v1/graphql";
const FAUCET_CONTRACT = "0x89Ebc05dE83aB9752B95030218BB10A542b96B7C";
const TEST_USDC_FAUCET = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: {
      http: [RPC_URL, "https://api.infra.testnet.somnia.network"],
      webSocket: [WS_RPC_URL],
    },
    public: {
      http: [RPC_URL, "https://api.infra.testnet.somnia.network"],
      webSocket: [WS_RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

async function main() {
  console.log("=== EPOCHLINE LIVE DISCOVERY PROBE ===");
  console.log("Network: Somnia Shannon Testnet (Chain ID 50312)");
  console.log("RPC Endpoint:", RPC_URL);
  console.log("WS Endpoint:", WS_RPC_URL);
  console.log("Indexer:", INDEXER_URL);

  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(RPC_URL),
  });

  const blockNumber = await publicClient.getBlockNumber();
  console.log(`Current Block Number: ${blockNumber}`);

  console.log("\n1. Initializing SomniaMarkets SDK...");
  const exchange = new SomniaMarkets({
    chain: somniaTestnet,
    indexerUrl: INDEXER_URL,
    wsRpcUrl: WS_RPC_URL,
    addresses: SOMNIA_TESTNET_ADDRESSES,
  });

  console.log("2. Discovering live binary markets...");
  let binaryMarkets: any[] = [];
  try {
    const listRes = await exchange.client.listBinaryMarkets({ limit: 100 });
    binaryMarkets = listRes || [];
    console.log(`Discovered ${binaryMarkets.length} binary markets from indexer.`);
  } catch (err: any) {
    console.warn("Indexer query note:", err.message);
  }

  console.log("\n3. Inspecting on-chain market status for candidates...");
  const probedMarkets: any[] = [];
  const poolToMarketsMap: Record<string, any[]> = {};

  for (const m of binaryMarkets) {
    const marketId = m.marketId || m.info?.marketId;
    if (!marketId) continue;

    try {
      // Direct on-chain read via publicClient or SDK
      const marketData: any = await publicClient.readContract({
        address: SOMNIA_TESTNET_ADDRESSES.binaryModule,
        abi: binaryModuleReadAbi,
        functionName: "getMarket",
        args: [marketId as `0x${string}`],
      });

      const poolAddr = marketData.pool || m.poolAddress || "unknown";
      const status = Number(marketData.status ?? 0);
      const tradingStart = marketData.tradingStart?.toString() || m.tradingStart?.toString() || "0";
      const expiry = marketData.expiry?.toString() || m.expiry?.toString() || "0";
      const yesId = marketData.yesId?.toString() || "0";
      const noId = marketData.noId?.toString() || "1";
      const oracleQuestionId = marketData.oracleQuestionId || m.oracleQuestionId || "unknown";

      const record = {
        marketId,
        symbol: m.symbol || `${m.asset || "BTC"} ${m.intervalSec || "300"}s`,
        asset: m.asset || "BTC",
        intervalSec: Number(m.intervalSec || 300),
        tradingStart,
        expiry,
        marketAddress: SOMNIA_TESTNET_ADDRESSES.binaryModule,
        poolAddress: poolAddr,
        venueId: m.venueId || "0x0000000000000000000000000000000000000000000000000000000000000000",
        oracleQuestionId,
        status,
        statusName: ["Listed", "Trading", "Locked", "Settling", "Resolved", "Voided"][status] || "Unknown",
        outcomeToken: SOMNIA_TESTNET_ADDRESSES.binaryModule,
        yesId,
        noId,
        capturedAtBlock: blockNumber.toString(),
      };

      probedMarkets.push(record);

      if (poolAddr && poolAddr !== "unknown" && poolAddr !== "0x0000000000000000000000000000000000000000") {
        const poolKey = poolAddr.toLowerCase();
        if (!poolToMarketsMap[poolKey]) {
          poolToMarketsMap[poolKey] = [];
        }
        poolToMarketsMap[poolKey].push(record);
      }
    } catch (e: any) {
      // Fallback try with SDK
      try {
        const onchain = await exchange.client.getMarketOnchain(marketId as `0x${string}`);
        const poolAddr = onchain.pool || m.poolAddress || "unknown";
        const record = {
          marketId,
          symbol: m.symbol || `${m.asset || "BTC"} ${m.intervalSec || "300"}s`,
          asset: m.asset || "BTC",
          intervalSec: Number(m.intervalSec || 300),
          tradingStart: onchain.tradingStart ? onchain.tradingStart.toString() : (m.tradingStart?.toString() || "0"),
          expiry: onchain.expiry ? onchain.expiry.toString() : (m.expiry?.toString() || "0"),
          marketAddress: SOMNIA_TESTNET_ADDRESSES.binaryModule,
          poolAddress: poolAddr,
          venueId: m.venueId || "0x0000000000000000000000000000000000000000000000000000000000000000",
          oracleQuestionId: m.oracleQuestionId || onchain.oracleQuestionId || "unknown",
          status: onchain.status,
          statusName: ["Listed", "Trading", "Locked", "Settling", "Resolved", "Voided"][onchain.status] || "Unknown",
          outcomeToken: SOMNIA_TESTNET_ADDRESSES.binaryModule,
          yesId: onchain.yesId ? onchain.yesId.toString() : "0",
          noId: onchain.noId ? onchain.noId.toString() : "1",
          capturedAtBlock: blockNumber.toString(),
        };
        probedMarkets.push(record);
        if (poolAddr && poolAddr !== "unknown") {
          const poolKey = poolAddr.toLowerCase();
          if (!poolToMarketsMap[poolKey]) {
            poolToMarketsMap[poolKey] = [];
          }
          poolToMarketsMap[poolKey].push(record);
        }
      } catch (err2: any) {
        // Skip silent error
      }
    }
  }

  console.log(`Successfully verified ${probedMarkets.length} markets on-chain.`);

  const statusCounts = probedMarkets.reduce((acc, m) => {
    acc[m.statusName] = (acc[m.statusName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("On-chain Status Breakdown:", statusCounts);

  // Find pools with multiple markets or identify recycled instances
  const recycledPools = Object.entries(poolToMarketsMap).filter(([_, list]) => list.length > 1);
  console.log(`\nFound ${recycledPools.length} pool(s) with multiple associated market instances in scan.`);

  for (const [pool, list] of recycledPools.slice(0, 5)) {
    console.log(`\nPool ${pool} recycled across ${list.length} market instances:`);
    list.forEach((m) => console.log(`  - Market: ${m.marketId} (${m.symbol}) | Start: ${m.tradingStart} | Expiry: ${m.expiry} | Status: ${m.statusName}`));
  }

  // Probe history surfaces
  console.log("\n4. Probing History Surfaces (Broad Pool vs Exact Market Scoping)...");
  let historyComparison: any = null;

  const target = probedMarkets.find((m) => m.statusName === "Trading") || probedMarkets[0];
  if (target) {
    console.log(`\nTarget Probe Market: ${target.marketId} (${target.symbol})`);
    console.log(`Pool Address: ${target.poolAddress}`);
    console.log(`Time Window: Start ${target.tradingStart} -> Expiry ${target.expiry} | Status: ${target.statusName}`);

    let broadPoolFills: any[] = [];
    let scopedMarketFills: any[] = [];
    let broadPoolCandles: any[] = [];

    try {
      if (target.poolAddress && target.poolAddress !== "unknown" && target.poolAddress !== "0x0000000000000000000000000000000000000000") {
        broadPoolFills = await exchange.client.getFills({ pool: target.poolAddress as `0x${string}`, limit: 100 });
      }
    } catch (e: any) {
      console.log("Pool fills query note:", e.message);
    }

    try {
      scopedMarketFills = await exchange.client.getFills({ market: target.marketId as `0x${string}`, limit: 100 });
    } catch (e: any) {
      console.log("Market fills query note:", e.message);
    }

    try {
      if (target.poolAddress && target.poolAddress !== "unknown") {
        broadPoolCandles = await exchange.client.getCandles({ pool: target.poolAddress as `0x${string}`, interval: 60, limit: 100 });
      }
    } catch (e: any) {
      console.log("Pool candles query note:", e.message);
    }

    const distinctMarketsInBroadFills = Array.from(new Set(broadPoolFills.map((f: any) => f.marketId || f.market || f.marketAddress).filter(Boolean)));
    const foreignFillsCount = broadPoolFills.filter((f: any) => {
      const mId = f.marketId || f.market;
      return mId && mId.toLowerCase() !== target.marketId.toLowerCase();
    }).length;

    historyComparison = {
      targetMarketId: target.marketId,
      symbol: target.symbol,
      poolAddress: target.poolAddress,
      tradingStart: target.tradingStart,
      expiry: target.expiry,
      broadPoolFills: {
        totalRows: broadPoolFills.length,
        distinctMarketIds: distinctMarketsInBroadFills,
        foreignRowCount: foreignFillsCount,
      },
      scopedMarketFills: {
        totalRows: scopedMarketFills.length,
      },
      broadPoolCandlesCount: broadPoolCandles.length,
      poolReuseDemonstrated: recycledPools.length > 0,
    };

    console.log(`Broad Pool Fills: ${broadPoolFills.length} rows`);
    console.log(`Distinct Market IDs in Broad Pool: ${distinctMarketsInBroadFills.length}`);
    console.log(`Foreign Rows in Broad Pool: ${foreignFillsCount}`);
    console.log(`Exact Scoped Market Fills: ${scopedMarketFills.length} rows`);
  }

  // Probe Faucet Contract
  console.log("\n5. Checking Testnet Faucet Contracts...");
  let faucetBytecode = "0x";
  let usdcFaucetBytecode = "0x";
  try {
    faucetBytecode = await publicClient.getBytecode({ address: FAUCET_CONTRACT as `0x${string}` }) || "0x";
    usdcFaucetBytecode = await publicClient.getBytecode({ address: TEST_USDC_FAUCET as `0x${string}` }) || "0x";
    console.log(`Direct DreamDEX Token Faucet (${FAUCET_CONTRACT}) code size: ${faucetBytecode.length} bytes`);
    console.log(`TestUSDC Faucet (${TEST_USDC_FAUCET}) code size: ${usdcFaucetBytecode.length} bytes`);
  } catch (e: any) {
    console.warn("Faucet probe note:", e.message);
  }

  const discoveryOutput = {
    timestamp: new Date().toISOString(),
    network: "Somnia Shannon Testnet",
    chainId: 50312,
    blockNumber: Number(blockNumber),
    rpcUrl: RPC_URL,
    totalBinaryMarketsDiscovered: binaryMarkets.length,
    probedMarketsCount: probedMarkets.length,
    statusBreakdown: statusCounts,
    markets: probedMarkets,
    poolToMarketsMap,
    recycledPoolsSummary: recycledPools.map(([pool, list]) => ({
      pool,
      marketCount: list.length,
      marketIds: list.map((m) => m.marketId),
      markets: list.map((m) => ({
        marketId: m.marketId,
        symbol: m.symbol,
        tradingStart: m.tradingStart,
        expiry: m.expiry,
        status: m.statusName,
      })),
    })),
    historyComparison,
    faucets: {
      directDreamDexFaucet: {
        address: FAUCET_CONTRACT,
        hasCode: faucetBytecode !== "0x",
      },
      testUsdcFaucet: {
        address: TEST_USDC_FAUCET,
        hasCode: usdcFaucetBytecode !== "0x",
      },
    },
  };

  fs.writeFileSync(
    path.join(process.cwd(), "evidence/raw/markets-raw.json"),
    JSON.stringify(binaryMarkets, null, 2)
  );

  fs.writeFileSync(
    path.join(process.cwd(), "evidence/discovery-probe.json"),
    JSON.stringify(discoveryOutput, null, 2)
  );

  console.log("\nSaved live probe evidence to evidence/discovery-probe.json and evidence/raw/markets-raw.json");
  console.log("=== PROBE COMPLETE ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Probe failed:", err);
  process.exit(1);
});
