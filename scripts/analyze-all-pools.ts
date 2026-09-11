import * as fs from "fs";
import * as path from "path";

interface MarketRecord {
  marketId: string;
  symbol: string;
  asset: string;
  intervalSec: number;
  tradingStart: string;
  expiry: string;
  marketAddress: string;
  poolAddress: string;
  status: number;
  statusName: string;
}

interface ProbeData {
  timestamp: string;
  network: string;
  chainId: number;
  blockNumber: number;
  totalBinaryMarketsDiscovered: number;
  probedMarketsCount: number;
  markets: MarketRecord[];
}

const data: ProbeData = JSON.parse(
  fs.readFileSync("evidence/discovery-probe.json", "utf8")
);

const poolMap: Record<string, MarketRecord[]> = {};

for (const m of data.markets) {
  const p = m.poolAddress.toLowerCase();
  if (p && p !== "unknown" && p !== "0x0000000000000000000000000000000000000000") {
    if (!poolMap[p]) {
      poolMap[p] = [];
    }
    poolMap[p].push(m);
  }
}

const recycledPools = Object.entries(poolMap).filter(([_, list]) => list.length > 1);

console.log(`Total unique active/resolved pools discovered: ${Object.keys(poolMap).length}`);
console.log(`Recycled pools count (pools spanning >1 market instance): ${recycledPools.length}`);

interface PoolContaminationResult {
  poolAddress: string;
  marketCount: number;
  markets: {
    marketId: string;
    symbol: string;
    status: string;
    tradingStart: number;
    expiry: number;
  }[];
  activeMarketId?: string;
  activeSymbol?: string;
  totalMarketWindowsIngested: number;
  foreignMarketWindows: number;
  contaminationRatePct: number;
  crossAssetContamination: boolean;
  assetsSpanned: string[];
}

const results: PoolContaminationResult[] = [];

for (const [pool, markets] of recycledPools) {
  // Sort by tradingStart ascending
  const sorted = [...markets].sort((a, b) => Number(a.tradingStart) - Number(b.tradingStart));
  const activeOrLatest = sorted.find(m => m.statusName === "Trading") || sorted[sorted.length - 1];
  
  const distinctAssets = Array.from(new Set(sorted.map(m => m.asset)));
  const totalWindows = sorted.length;
  const foreignWindows = totalWindows - 1;
  const contaminationRate = ((foreignWindows) / totalWindows) * 100;

  results.push({
    poolAddress: pool,
    marketCount: totalWindows,
    markets: sorted.map(m => ({
      marketId: m.marketId,
      symbol: m.symbol,
      status: m.statusName,
      tradingStart: Number(m.tradingStart),
      expiry: Number(m.expiry),
    })),
    activeMarketId: activeOrLatest.marketId,
    activeSymbol: activeOrLatest.symbol,
    totalMarketWindowsIngested: totalWindows,
    foreignMarketWindows: foreignWindows,
    contaminationRatePct: Number(contaminationRate.toFixed(2)),
    crossAssetContamination: distinctAssets.length > 1,
    assetsSpanned: distinctAssets,
  });
}

// Sort results by marketCount descending
results.sort((a, b) => b.marketCount - a.marketCount);

const rates = results.map(r => r.contaminationRatePct);
const minRate = Math.min(...rates);
const maxRate = Math.max(...rates);
const meanRate = rates.reduce((a, b) => a + b, 0) / rates.length;
const sortedRates = [...rates].sort((a, b) => a - b);
const medianRate =
  sortedRates.length % 2 === 0
    ? (sortedRates[sortedRates.length / 2 - 1] + sortedRates[sortedRates.length / 2]) / 2
    : sortedRates[Math.floor(sortedRates.length / 2)];

const crossAssetCount = results.filter(r => r.crossAssetContamination).length;

const summary = {
  scanTimestamp: data.timestamp,
  blockNumber: data.blockNumber,
  chainId: data.chainId,
  totalMarketsScanned: data.probedMarketsCount,
  totalRecycledPoolsFound: recycledPools.length,
  stats: {
    minContaminationPct: Number(minRate.toFixed(2)),
    maxContaminationPct: Number(maxRate.toFixed(2)),
    meanContaminationPct: Number(meanRate.toFixed(2)),
    medianContaminationPct: Number(medianRate.toFixed(2)),
    crossAssetContaminatedPools: crossAssetCount,
    crossAssetPct: Number(((crossAssetCount / recycledPools.length) * 100).toFixed(2)),
  },
  pools: results,
};

fs.writeFileSync(
  "evidence/pool-contamination-full-scan.json",
  JSON.stringify(summary, null, 2)
);

console.log("\n=== FULL 18-POOL CONTAMINATION DISTRIBUTION ===");
console.log(`Pools Count: ${recycledPools.length}`);
console.log(`Min Contamination Rate: ${minRate.toFixed(2)}%`);
console.log(`Max Contamination Rate: ${maxRate.toFixed(2)}%`);
console.log(`Mean Contamination Rate: ${meanRate.toFixed(2)}%`);
console.log(`Median Contamination Rate: ${medianRate.toFixed(2)}%`);
console.log(`Cross-Asset Recycled Pools: ${crossAssetCount}/${recycledPools.length} (${((crossAssetCount/recycledPools.length)*100).toFixed(1)}%)`);

console.log("\nPer-Pool Table:");
console.table(
  results.map(r => ({
    Pool: `${r.poolAddress.slice(0, 10)}...${r.poolAddress.slice(-6)}`,
    Markets: r.marketCount,
    Target: r.activeSymbol,
    Foreign: r.foreignMarketWindows,
    "Contam %": `${r.contaminationRatePct}%`,
    "Cross-Asset": r.crossAssetContamination ? "YES" : "NO",
    Assets: r.assetsSpanned.join(", "),
  }))
);
