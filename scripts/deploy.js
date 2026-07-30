const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying with:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

    const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");

    const registry = await LandRegistry.deploy(deployer.address);

    // Wait for deployment
    await registry.waitForDeployment();

    console.log("LandRegistry deployed to:");
    console.log(await registry.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});