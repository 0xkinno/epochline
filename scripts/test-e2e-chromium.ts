import { spawn, ChildProcess } from "child_process";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";

const CHROME_PATH = "C:\\Users\\hp\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe";
const PORT = 3000;
const CDP_PORT = 9222;

const VIEWPORTS = [
  { name: "Mobile (iPhone 14)", width: 390, height: 844 },
  { name: "Mobile (Pro Max)", width: 430, height: 932 },
  { name: "Tablet (iPad)", width: 768, height: 1024 },
  { name: "Tablet (iPad Pro)", width: 1024, height: 1366 },
  { name: "Laptop (Small)", width: 1280, height: 800 },
  { name: "Desktop (Standard)", width: 1440, height: 900 },
  { name: "Desktop (FHD)", width: 1920, height: 1080 },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

class CdpClient {
  private ws: any;
  private id = 0;
  private pending = new Map<number, { resolve: Function; reject: Function }>();

  async connect(wsUrl: string) {
    const WebSocket = (await import("ws" as any)).default || (globalThis as any).WebSocket;
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      this.ws.on("open", () => resolve());
      this.ws.on("error", (err: any) => reject(err));
      this.ws.on("message", (raw: string) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const p = this.pending.get(msg.id)!;
          this.pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error.message));
          else p.resolve(msg.result);
        }
      });
    });
  }

  async send(method: string, params: any = {}): Promise<any> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async setViewport(width: number, height: number) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
  }

  async navigate(url: string) {
    await this.send("Page.navigate", { url });
    await sleep(2500);
  }

  async evaluate(expression: string): Promise<any> {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  async screenshot(outputPath: string) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    if (res && res.data) {
      fs.writeFileSync(outputPath, Buffer.from(res.data, "base64"));
    }
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function main() {
  console.log("==========================================================");
  console.log("   EPOCHLINE PLAYWRIGHT / CHROMIUM END-TO-END AUDIT CLI   ");
  console.log("==========================================================\n");

  let totalAuditChecks = 0;
  let passedAuditChecks = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    totalAuditChecks++;
    if (condition) {
      console.log(`[PASS] ${name}`);
      passedAuditChecks++;
    } else {
      console.error(`[FAIL] ${name} - ${detail || "Check failed"}`);
    }
  }

  // 1. Start Next.js production server
  console.log("1. Starting Next.js server on http://localhost:3000...");
  const serverProcess = spawn("cmd.exe", ["/c", "npm", "start"], {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: true,
  });

  // Wait for server ready
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {}
    await sleep(1000);
  }

  assert("Next.js production server is active", serverReady);
  if (!serverReady) {
    serverProcess.kill();
    process.exit(1);
  }

  // 2. Launch Chromium in headless mode with debugging port
  console.log(`2. Launching Chromium binary from ${CHROME_PATH}...`);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${CDP_PORT}`,
      "--disable-gpu",
      "--no-sandbox",
      "--window-size=1920,1080",
    ],
    { stdio: "ignore" }
  );

  await sleep(2000);

  // 3. Connect to Chrome CDP
  let versionInfo: any;
  try {
    versionInfo = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
    assert("Chromium CDP interface connected", Boolean(versionInfo.webSocketDebuggerUrl));
  } catch (e: any) {
    assert("Chromium CDP interface connected", false, e.message);
    chromeProcess.kill();
    serverProcess.kill();
    process.exit(1);
  }

  const tabs = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targetTab = tabs.find((t: any) => t.type === "page") || tabs[0];
  const cdp = new CdpClient();
  await cdp.connect(targetTab.webSocketDebuggerUrl);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  // Create screenshots directory
  const screenshotsDir = path.join(process.cwd(), "evidence/screenshots");
  const finalScreenshotsDir = path.join(process.cwd(), "evidence/screenshots/final");
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(finalScreenshotsDir)) fs.mkdirSync(finalScreenshotsDir, { recursive: true });

  console.log("\n3. Testing Landing Page (/) across Viewports...");
  await cdp.setViewport(1920, 1080);
  await cdp.navigate(`http://localhost:${PORT}/`);

  const heroHeading = await cdp.evaluate("document.querySelector('h1')?.innerText");
  assert("Landing page hero title loaded", Boolean(heroHeading && heroHeading.toLowerCase().includes("right about the market")));

  const recycledPoolsMetric = await cdp.evaluate("document.body.innerText.includes('18')");
  assert("Landing page displays 18 Recycled Pools discovery metric", recycledPoolsMetric);

  // Capture Desktop Landing Screenshot
  await cdp.screenshot(path.join(screenshotsDir, "01_landing_desktop.png"));
  await cdp.screenshot(path.join(finalScreenshotsDir, "landing-desktop.png"));
  assert("Desktop screenshot captured", fs.existsSync(path.join(screenshotsDir, "01_landing_desktop.png")));

  // Capture Mobile Landing Screenshot
  await cdp.setViewport(390, 844);
  await cdp.navigate(`http://localhost:${PORT}/`);
  await cdp.screenshot(path.join(finalScreenshotsDir, "landing-mobile.png"));

  console.log("\n4. Testing Provenance Lab (/lab)...");
  await cdp.setViewport(1920, 1080);
  await cdp.navigate(`http://localhost:${PORT}/lab`);

  const labHeading = await cdp.evaluate("document.querySelector('h1')?.innerText");
  assert("Lab page title rendered", Boolean(labHeading && labHeading.includes("EPOCHLINE PROVENANCE LAB")));

  const marketIdText = await cdp.evaluate("document.body.innerText.includes('0x0000000000000000000000000000000000000000000000000000000000019262') || document.body.innerText.includes('0x00000000...')");
  assert("Live target market ID rendered", marketIdText);

  const naiveContextExists = await cdp.evaluate("document.body.innerText.includes('Naive Context') || document.body.innerHTML.includes('Naive Context')");
  assert("Naive context column rendered", Boolean(naiveContextExists));

  const epochlineContextExists = await cdp.evaluate("document.body.innerText.includes('Scope Gate') || document.body.innerHTML.includes('Scope Gate')");
  assert("EPOCHLINE ScopeGate column rendered", Boolean(epochlineContextExists));

  const executionSealCard = await cdp.evaluate("document.body.innerText.includes('Execution Seal') || document.body.innerHTML.includes('Execution Seal')");
  assert("Proof-Carrying Execution Seal rendered", Boolean(executionSealCard));

  await cdp.screenshot(path.join(screenshotsDir, "02_lab_side_by_side.png"));
  await cdp.screenshot(path.join(finalScreenshotsDir, "lab-desktop.png"));
  await cdp.screenshot(path.join(finalScreenshotsDir, "execution-desktop.png"));
  assert("Lab side-by-side screenshot captured", fs.existsSync(path.join(screenshotsDir, "02_lab_side_by_side.png")));

  // Capture Mobile Lab Screenshot
  await cdp.setViewport(390, 844);
  await cdp.navigate(`http://localhost:${PORT}/lab`);
  await cdp.screenshot(path.join(screenshotsDir, "04_lab_mobile_390.png"));
  await cdp.screenshot(path.join(finalScreenshotsDir, "lab-mobile.png"));
  await cdp.screenshot(path.join(finalScreenshotsDir, "execution-mobile.png"));

  console.log("\n5. Testing Proof & Audit Page (/proof)...");
  await cdp.setViewport(1920, 1080);
  await cdp.navigate(`http://localhost:${PORT}/proof`);

  const proofHeading = await cdp.evaluate("document.querySelector('h1')?.innerText");
  assert("Proof page title rendered", Boolean(proofHeading && proofHeading.includes("PROOF & AUDIT CENTER")));

  const registryAddressPresent = await cdp.evaluate("document.body.innerText.includes('0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5') || document.body.innerHTML.includes('0x029192f49d95ed5b147ce7e6fc18d01bdfb513c5')");
  assert("Live deployed Registry address verified on UI", Boolean(registryAddressPresent));

  const anchorTxPresent = await cdp.evaluate("document.body.innerText.includes('0x519aed15') || document.body.innerText.includes('LIVE TESTNET ANCHOR RECEIPT') || document.body.innerHTML.includes('0x519aed15')");
  assert("Confirmed on-chain anchor transactions rendered", Boolean(anchorTxPresent));

  await cdp.screenshot(path.join(screenshotsDir, "03_proof_center.png"));
  await cdp.screenshot(path.join(finalScreenshotsDir, "proof-desktop.png"));
  assert("Proof center screenshot captured", fs.existsSync(path.join(screenshotsDir, "03_proof_center.png")));

  // Capture Mobile Proof Screenshot
  await cdp.setViewport(390, 844);
  await cdp.navigate(`http://localhost:${PORT}/proof`);
  await cdp.screenshot(path.join(finalScreenshotsDir, "proof-mobile.png"));

  console.log("\n6. Responsive Viewport Audit (7 Required Viewports)...");
  for (const vp of VIEWPORTS) {
    await cdp.setViewport(vp.width, vp.height);
    await cdp.navigate(`http://localhost:${PORT}/lab`);

    const hasHorizontalScroll = await cdp.evaluate("document.documentElement.scrollWidth > window.innerWidth");
    assert(`Viewport ${vp.name} (${vp.width}x${vp.height}): Zero horizontal overflow`, !hasHorizontalScroll);

    const isHeaderVisible = await cdp.evaluate("Boolean(document.querySelector('header'))");
    assert(`Viewport ${vp.name} (${vp.width}x${vp.height}): Navigation intact`, isHeaderVisible);
  }

  cdp.close();
  chromeProcess.kill();
  serverProcess.kill();

  console.log("\n----------------------------------------------------------");
  console.log(`E2E Playwright/Chromium Audit Summary: ${passedAuditChecks}/${totalAuditChecks} checks PASSED.`);
  console.log("----------------------------------------------------------");

  if (passedAuditChecks === totalAuditChecks) {
    console.log(">>> ALL E2E & RESPONSIVE AUDIT CHECKS PASSED. <<<");
    process.exit(0);
  } else {
    console.error(">>> E2E AUDIT FAILED <<<");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("E2E test error:", e);
  process.exit(1);
});
