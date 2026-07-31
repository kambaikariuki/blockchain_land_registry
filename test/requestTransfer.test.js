const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Transfer Requests", function () {
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

  // Transfer requests tests

  it("should allow the owner to create a request", async function () {
    await registry.registerProperty(1001, owner.address);

    await registry.connect(owner).requestTransfer(1001, buyer.address);

    const request = await registry.getTransferRequest(1001);

    expect(request[0]).to.equal(owner.address);
    expect(request[1]).to.equal(buyer.address);
    expect(request[3]).to.equal(true);
  });

  it("should reject transfer requests from non-owners", async function () {
    await registry.registerProperty(1001, owner.address);

    await expect(
      registry.connect(buyer).requestTransfer(1001, buyer.address),
    ).to.be.revertedWith("Only the current owner can request a transfer.");
  });

  it("should reject transfer requests for non-existent properties", async function () {
    await expect(
      registry.connect(owner).requestTransfer(1001, buyer.address),
    ).to.be.revertedWith("Property does not exist.");
  });

  it("should reject duplicate pending transfer requests", async function () {
    await registry.registerProperty(1001, owner.address);

    await registry.connect(owner).requestTransfer(1001, buyer.address);

    await expect(
      registry.connect(owner).requestTransfer(1001, buyer.address),
    ).to.be.revertedWith("Transfer request already pending.");
  });

  it("should reject invalid buyer address", async function () {
    await registry.registerProperty(1001, owner.address);

    await expect(
      registry.connect(owner).requestTransfer(1001, ethers.ZeroAddress),
    ).to.be.revertedWith("Invalid buyer.");
  });
});
