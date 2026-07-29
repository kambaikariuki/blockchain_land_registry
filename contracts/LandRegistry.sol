//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract LandRegistry is AccessControl {

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    struct Property {
        uint256 parcelId;
        address currentOwner;
        bytes32 currentCertificate;
        uint256 certificateVersion;
        uint256 registeredAt;
        bool exists;
    }

    mapping(uint256 => Property) private properties;

    event PropertyRegistered(
        uint256 indexed parcelId,
        address indexed owner,
        bytes32 certificateHash
    );

    function registerProperty(uint256 parcelId, address owner) external onlyRole(REGISTRAR_ROLE){
        require(owner != address(0), "Invalid owner");
        require(!properties[parcelId].exists, "Property already exists");

        bytes32 certificateHash = keccak256(
            abi.encode(parcelId, owner, uint256(1))
        );

        properties[parcelId] = Property({
            parcelId: parcelId,
            currentOwner: owner,
            currentCertificate: certificateHash,
            certificateVersion: 1,
            registeredAt: block.timestamp,
            exists: true
        });

        emit PropertyRegistered(parcelId, owner, certificateHash);
    }

    function getProperty(uint256 parcelId) external view returns (
        uint256,
        address,
        bytes32,
        uint256,
        uint256
    ) {
        require(properties[parcelId].exists, "Property not found");

        Property memory property = properties[parcelId];

        return(
            property.parcelId,
            property.currentOwner,
            property.currentCertificate,
            property.certificateVersion,
            property.registeredAt
        );
    }

    function isRegistered(uint256 parcelId) external view returns (bool) {
        return properties[parcelId].exists;
    }
    
    function addRegistrar(address registrar) external onlyRole(DEFAULT_ADMIN_ROLE){
        grantRole(REGISTRAR_ROLE, registrar);
    }

    function removeRegistrar(address registrar) external onlyRole(DEFAULT_ADMIN_ROLE){
        revokeRole(REGISTRAR_ROLE, registrar);
    }

}