const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Verifiy Certificate", function () {
    let registry;
    let admin;
    let owner;
    let buyer;
    
    beforeEach(async function () {
        [admin, owner, buyer] = await ethers.getSigners();

        const LandRegistry = await ethers.getContractFactory("LandRegistry");

        registry = await LandRegistry.deploy(admin.address);

        await registry.waitForDeployment();

        await registry.registerProperty(1001,owner.address);

    });

    // Verify certificate
    it("should return true and match the certificate hash", async function () {

        const property = await registry.getProperty(1001);
        const result = await registry.verifyCertificate(1001, property[2]);

        expect(result[0]).to.equal(true);
    });

    it("should not match an outdated certificate", async function () {
        const oldOwnership = await registry.getProperty(1001);

        await registry
            .connect(owner)
            .requestTransfer(1001, buyer.address);

        await registry.approveTransfer(1001);

        const newOwnership = await registry.getProperty(1001);

        const result = await registry.verifyCertificate(1001, newOwnership[2]);

        expect(result[0]).to.equal(true);
        expect(newOwnership[2]).to.not.equal(oldOwnership[2]);
        expect(newOwnership[3]).to.equal(oldOwnership[3] + 1n);
    })

    it("should revert if the property doesn't exist", async function () {
        const property = await registry.getProperty(1001);
        await expect(
            registry.verifyCertificate(1002, property[2])
        ).to.be.revertedWith("Property not found.");
    });

    it("should return false for an invalid certificate hash", async function () {
        await registry.registerProperty(1002, owner.address);

        const property2 = await registry.getProperty(1002);

        const result = await registry.verifyCertificate(
            1001,
            property2[2]
        );

        expect(result[0]).to.equal(false);
    })

});