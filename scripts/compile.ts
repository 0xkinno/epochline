import solc from "solc";
import * as fs from "fs";
import * as path from "path";

async function compile() {
  console.log("Compiling EpochlineRegistry.sol...");
  const contractPath = path.join(process.cwd(), "contracts/EpochlineRegistry.sol");
  let source = fs.readFileSync(contractPath, "utf-8");
  if (source.charCodeAt(0) === 0xFEFF) {
    source = source.slice(1);
  }

  const input = {
    language: "Solidity",
    sources: {
      "EpochlineRegistry.sol": {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const error of output.errors) {
      if (error.severity === "error") {
        console.error("Solc error:", error.formattedMessage);
        hasError = true;
      } else {
        console.warn("Solc warning:", error.formattedMessage);
      }
    }
    if (hasError) process.exit(1);
  }

  const contract = output.contracts["EpochlineRegistry.sol"]["EpochlineRegistry"];
  const compiledArtifact = {
    contractName: "EpochlineRegistry",
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  };

  fs.writeFileSync(
    path.join(process.cwd(), "contracts/EpochlineRegistry.json"),
    JSON.stringify(compiledArtifact, null, 2),
    { encoding: "utf8" }
  );

  console.log("Compilation successful! Saved to contracts/EpochlineRegistry.json");
  console.log(`Bytecode size: ${compiledArtifact.bytecode.length / 2} bytes`);
}

compile().catch((e) => {
  console.error("Compile error:", e);
  process.exit(1);
});
