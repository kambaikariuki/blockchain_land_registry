const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
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

        await registry.registerProperty(1001,owner.address);

        const property = await registry.getProperty(1001);

        expect(property[0]).to.equal(1001n);
        expect(property[1]).to.equal(owner.address);
        expect(property[3]).to.equal(1n);
        
    });

    it("shoud reject duplicate registration of parcel", async function () {

        await registry.registerProperty(1001, owner.address);

        await expect(
            registry.registerProperty(1001, owner.address)
        ).to.be.reverted;
    });

    // Transfer requests tests

    it("should allow the owner to create a request", async function () {

        await registry.registerProperty(1001, owner.address);

        await registry
            .connect(owner)
            .requestTransfer(1001, buyer.address);

        const request = await registry.getTransferRequest(1001);

        expect(request[0]).to.equal(owner.address);
        expect(request[1]).to.equal(buyer.address);
        expect(request[3]).to.equal(true);
    });

    it("should reject transfer requests from non-owners", async function () {
        await registry.registerProperty(1001, owner.address);

        await expect(
            registry
            .connect(buyer)
            .requestTransfer(1001, buyer.address)
        ).to.be.revertedWith("Only the current owner can request a transfer.");
        
    });

    it("should reject transfer requests for non-existent properties", async function () {
        await expect(
            registry
            .connect(owner)
            .requestTransfer(1001, buyer.address)
        ).to.be.revertedWith("Property does not exist.");
    });

    it("should reject duplicate pending transfer requests", async function () {
        await registry.registerProperty(1001, owner.address);

        await registry
            .connect(owner)
            .requestTransfer(1001, buyer.address);

        await expect(
            registry
            .connect(owner)
            .requestTransfer(1001, buyer.address)
        ).to.be.revertedWith("Transfer request already pending.");
    });

    it("should reject invalid buyer address", async function () {
        await registry.registerProperty(1001, owner.address);

        await expect(
            registry
            .connect(owner)
            .requestTransfer(1001, ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid buyer.")
    })

})