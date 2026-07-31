const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Approve Transfer Requests", function () {
  let registry;
  let admin;
  let owner;
  let buyer;

  beforeEach(async function () {
    [admin, owner, buyer] = await ethers.getSigners();

    const LandRegistry = await ethers.getContractFactory("LandRegistry");

    registry = await LandRegistry.deploy(admin.address);

    await registry.waitForDeployment();

    await registry.registerProperty(1001, owner.address);

    await registry.connect(owner).requestTransfer(1001, buyer.address);
  });

  // Approve Transfer requests tests
  it("should allow a registrar to approve a request", async function () {
    await registry.approveTransfer(1001);

    const property = await registry.getProperty(1001);

    expect(property[1]).to.equal(buyer.address);
  });

  it("should not allow a non-registrar to approve a request", async function () {
    await expect(registry.connect(owner).approveTransfer(1001)).to.be.reverted;
  });

  it("should change property ownership after approval", async function () {
    await registry.approveTransfer(1001);

    const property = await registry.getProperty(1001);

    expect(property[1]).to.equal(buyer.address);
  });

  it("should increment the certificate version and change the certificate hash", async function () {
    const oldOwnership = await registry.getProperty(1001);

    await registry.approveTransfer(1001);

    const newOwnership = await registry.getProperty(1001);

    expect(newOwnership[3]).to.equal(oldOwnership[3] + 1n);
    expect(oldOwnership[2]).to.not.equal(newOwnership[2]);
  });

  it("should clear the pending transfer after approval", async function () {
    await registry.approveTransfer(1001);

    await expect(registry.getTransferRequest(1001)).to.be.revertedWith(
      "Transfer request not found.",
    );
  });
});
