const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [, deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");

  const registry = await LandRegistry.deploy(deployer.address);

  // Wait for deployment
  await registry.waitForDeployment();
  const artifact = await hre.artifacts.readArtifact("LandRegistry");

  fs.writeFileSync(
    path.join(__dirname, "../frontend/js/abi.json"),
    JSON.stringify(artifact.abi, null, 2),
  );

  console.log("ABI copied to frontend.");

  const address = await registry.getAddress();

  const config = `export const CONTRACT_ADDRESS = "${address}";
export const ABI = ${JSON.stringify(artifact.abi, null, 2)};
    `;

  fs.writeFileSync(path.join(__dirname, "../frontend/js/config.js"), config);

  console.log("LandRegistry deployed to:");
  console.log(await registry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
