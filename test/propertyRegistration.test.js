const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Property Registration", function () {
  let registry;
  let admin;
  let owner;
  let buyer;

  beforeEach(async function () {
    [admin, owner, buyer] = await ethers.getSigners();

    const LandRegistry = await ethers.getContractFactory("LandRegistry");

    registry = await LandRegistry.deploy(admin.address);

    await registry.waitForDeployment();
  });

  // Property Registration tests

  it("should give deployer registrar role", async function () {
    const role = await registry.REGISTRAR_ROLE();

    expect(await registry.hasRole(role, admin.address)).to.equal(true);
  });

  it("should register a property", async function () {
    await registry.registerProperty(1001, owner.address);

    const property = await registry.getProperty(1001);

    expect(property[0]).to.equal(1001n);
    expect(property[1]).to.equal(owner.address);
    expect(property[3]).to.equal(1n);
  });

  it("shoud reject duplicate registration of parcel", async function () {
    await registry.registerProperty(1001, owner.address);

    await expect(registry.registerProperty(1001, owner.address)).to.be.reverted;
  });
});
