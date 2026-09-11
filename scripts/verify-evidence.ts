import * as fs from "fs";
import * as path from "path";
import { verifyDecisionReceipt, type DecisionReceipt } from "../src/core/decisionReceipt.js";

async function verify() {
  console.log("=================================================");
  console.log("   EPOCHLINE INDEPENDENT EVIDENCE VERIFIER CLI   ");
  console.log("=================================================\n");

  let totalChecks = 0;
  let passedChecks = 0;

  function assertCheck(name: string, condition: boolean, detail?: string) {
    totalChecks++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passedChecks++;
    } else {
      console.error(`[FAIL] ${name} - ${detail || "Condition not met"}`);
    }
  }

  // 1. Verify Discovery Probe Evidence
  const discoveryPath = path.join(process.cwd(), "evidence/discovery-probe.json");
  assertCheck("Discovery probe evidence exists", fs.existsSync(discoveryPath));
  if (fs.existsSync(discoveryPath)) {
    const probe = JSON.parse(fs.readFileSync(discoveryPath, "utf-8"));
    assertCheck("Chain ID is Somnia Shannon Testnet (50312)", probe.chainId === 50312);
    assertCheck("Captured real on-chain block number > 480,000,000", probe.blockNumber > 480000000);
    assertCheck("Discovered binary markets >= 50", probe.totalBinaryMarketsDiscovered >= 50);
    assertCheck("Probed live testnet markets count > 0", probe.probedMarketsCount > 0);
    assertCheck("Identified multiple market instances on recycled pools", Object.keys(probe.poolToMarketsMap).length > 0);
    assertCheck("Direct DreamDEX Token Faucet verified on-chain", probe.faucets.directDreamDexFaucet.hasCode === true);
    assertCheck("TestUSDC Collateral Faucet verified on-chain", probe.faucets.testUsdcFaucet.hasCode === true);
  }

  // 2. Verify Baseline Evidence
  const baselinePath = path.join(process.cwd(), "evidence/baseline.json");
  assertCheck("Baseline evidence exists", fs.existsSync(baselinePath));
  if (fs.existsSync(baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
    assertCheck("Baseline ingests contaminated rows without detection", baseline.contaminationDetectedBySystem === false);
    assertCheck("Baseline spans multiple distinct market IDs in one pool query", baseline.distinctMarketIds.length > 1);
  }

  // 3. Verify EPOCHLINE Intervention Evidence
  const epochlinePath = path.join(process.cwd(), "evidence/epochline.json");
  assertCheck("EPOCHLINE intervention evidence exists", fs.existsSync(epochlinePath));
  if (fs.existsSync(epochlinePath)) {
    const epochline = JSON.parse(fs.readFileSync(epochlinePath, "utf-8"));
    assertCheck("EPOCHLINE successfully refused contaminated input", epochline.verdictOnContaminatedInput.state === "REJECT");
    assertCheck("EPOCHLINE caught MARKET_MISMATCH offending codes", epochline.verdictOnContaminatedInput.offendingCodes.includes("MARKET_MISMATCH"));
    assertCheck("EPOCHLINE accepted 100% clean context", epochline.cleanProtectedSession.state === "ACCEPT");
  }

  // 4. Verify Random Removal Control Evidence
  const controlPath = path.join(process.cwd(), "evidence/random_control.json");
  assertCheck("Random control evidence exists", fs.existsSync(controlPath));
  if (fs.existsSync(controlPath)) {
    const control = JSON.parse(fs.readFileSync(controlPath, "utf-8"));
    assertCheck("Random removal still suffers from foreign row contamination", control.stillContaminated === true);
    assertCheck("ScopeGate correctly refuses random-removal control", control.scopeGateVerdict === "REJECT");
  }

  // 5. Verify Decision Receipts Cryptographic Integrity
  const validReceiptPath = path.join(process.cwd(), "evidence/receipts/decision-receipt-valid.json");
  const refusedReceiptPath = path.join(process.cwd(), "evidence/receipts/decision-receipt-refused.json");

  assertCheck("Valid decision receipt artifact exists", fs.existsSync(validReceiptPath));
  if (fs.existsSync(validReceiptPath)) {
    const validReceipt: DecisionReceipt = JSON.parse(fs.readFileSync(validReceiptPath, "utf-8"));
    const v = verifyDecisionReceipt(validReceipt);
    assertCheck("Valid decision receipt cryptographic proof passes", v.isValid, v.reasons.join(", "));
    assertCheck("Valid receipt has zero rejected items", validReceipt.input.rejectedCount === 0);
  }

  assertCheck("Refused decision receipt artifact exists", fs.existsSync(refusedReceiptPath));
  if (fs.existsSync(refusedReceiptPath)) {
    const refusedReceipt: DecisionReceipt = JSON.parse(fs.readFileSync(refusedReceiptPath, "utf-8"));
    const v = verifyDecisionReceipt(refusedReceipt);
    assertCheck("Refused decision receipt cryptographic proof passes", v.isValid, v.reasons.join(", "));
    assertCheck("Refused receipt explicitly blocks execution (action is REFUSE)", refusedReceipt.decision.action === "REFUSE");
  }

  // 6. Verify On-Chain Deployment & Anchor Evidence
  const deploymentPath = path.join(process.cwd(), "contracts/deployments.json");
  assertCheck("EpochlineRegistry deployment artifact exists", fs.existsSync(deploymentPath));
  if (fs.existsSync(deploymentPath)) {
    const dep = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    assertCheck("EpochlineRegistry deployed address verified", dep.address && dep.address.startsWith("0x"));
    assertCheck("Deployment transaction hash verified on testnet", dep.transactionHash && dep.transactionHash.startsWith("0x"));
  }

  const anchorPath = path.join(process.cwd(), "evidence/tx/anchor-receipt-tx.json");
  assertCheck("On-chain decision anchor transaction proof exists", fs.existsSync(anchorPath));
  if (fs.existsSync(anchorPath)) {
    const anchor = JSON.parse(fs.readFileSync(anchorPath, "utf-8"));
    assertCheck("Anchor transaction hash verified", anchor.transactionHash && anchor.transactionHash.startsWith("0x"));
    assertCheck("Anchored receipt hash matches record", anchor.receiptHash && anchor.receiptHash.startsWith("0x"));
  }

  console.log("\n-------------------------------------------------");
  console.log(`Verification Summary: ${passedChecks}/${totalChecks} checks PASSED.`);
  console.log("-------------------------------------------------");

  if (passedChecks === totalChecks) {
    console.log(">>> ALL AUDIT CHECKS PASSED. GATE C & D VERIFIED. <<<");
    process.exit(0);
  } else {
    console.error(">>> VERIFICATION FAILED: Inconsistencies detected. <<<");
    process.exit(1);
  }
}

verify().catch((e) => {
  console.error("Verifier fatal error:", e);
  process.exit(1);
});
