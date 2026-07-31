//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract LandRegistry is AccessControl {

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    //Property Registration
    struct Property {
        uint256 parcelId;
        address currentOwner;
        bytes32 currentCertificate;
        uint256 certificateVersion;
        uint256 registeredAt;
        bool exists;
    }

    mapping(uint256 => Property) private properties;
    mapping(address => uint256[]) private ownedParcels;

    //Events

    event PropertyRegistered(
        uint256 indexed parcelId,
        address indexed owner,
        bytes32 certificateHash
    );

    //Functions

    function _generateCertificate(
        uint256 parcelId,
        address owner,
        uint256 version
    ) private pure returns (bytes32){
        return keccak256(
            abi.encode(parcelId, owner, version)
        );
    }


    function registerProperty(uint256 parcelId, address owner) external onlyRole(REGISTRAR_ROLE){
        require(owner != address(0), "Invalid owner");
        require(!properties[parcelId].exists, "Property already exists");

        bytes32 certificateHash = _generateCertificate(parcelId, owner, 1);

        properties[parcelId] = Property({
            parcelId: parcelId,
            currentOwner: owner,
            currentCertificate: certificateHash,
            certificateVersion: 1,
            registeredAt: block.timestamp,
            exists: true
        });

        ownedParcels[owner].push(parcelId);

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

    function isRegistrar(address account) external view returns (bool)
    {
        return hasRole(REGISTRAR_ROLE, account);
    }


    // Ownership transfer
    struct TransferRequest {
        address seller;
        address buyer;
        uint256 requestedAt;
        bool pending;
    }

    mapping(uint256 => TransferRequest) private transferRequests;

    uint256[] private pendingTransferParcels;

    //Events
    event TransferRequested(
        uint256 indexed parcelId,
        address indexed seller,
        address indexed buyer
    );

    event OwnershipTransferred(
        uint256 indexed parcelId,
        address indexed oldOwner,
        address indexed newOwner,
        bytes32 certificateHash
    );

    event TransferRejected(
        uint256 indexed parcelId
    );

    //Functions
    function requestTransfer(uint256 parcelId, address buyer) external {
        require(properties[parcelId].exists, "Property does not exist.");
        require(
            msg.sender == properties[parcelId].currentOwner, "Only the current owner can request a transfer."
            );
        require(buyer != address(0), "Invalid buyer.");

        require(
            !transferRequests[parcelId].pending, "Transfer request already pending."
        );

        transferRequests[parcelId] = TransferRequest({
            seller: msg.sender,
            buyer: buyer,
            requestedAt: block.timestamp,
            pending: true
        });

        pendingTransferParcels.push(parcelId);

        emit TransferRequested(
            parcelId,
            msg.sender,
            buyer
        );
    }

    function getTransferRequest(uint parcelId) external view returns (
        address,
        address,
        uint256,
        bool
    ){
        require(transferRequests[parcelId].pending, "Transfer request not found.");

        TransferRequest memory transferRequest = transferRequests[parcelId];

        return(
            transferRequest.seller,
            transferRequest.buyer,
            transferRequest.requestedAt,
            transferRequest.pending
        );
    }

    function getPendingTransfers() external view returns (uint256[] memory){
        return pendingTransferParcels;
    }


    // Approve transfer
    function approveTransfer(uint256 parcelId) external onlyRole(REGISTRAR_ROLE){
        //check parcel exists
        require(properties[parcelId].exists, "Property not found");
        //check if transfer is pending
        require(transferRequests[parcelId].pending, "No pending transfer request.");

        Property storage property = properties[parcelId];
        TransferRequest storage request = transferRequests[parcelId];
        // change ownership

        address oldOwner = property.currentOwner;
        address newOwner = request.buyer;

        _removeOwnedParcel(oldOwner, parcelId);
        ownedParcels[newOwner].push(parcelId);

        property.currentOwner = newOwner;
        property.certificateVersion++;

        // change certificate and increment certificate version
        bytes32 newCertificate = _generateCertificate(parcelId, newOwner, property.certificateVersion); 
        
        property.currentCertificate = newCertificate;

        delete transferRequests[parcelId];

        for (uint256 i = 0; i < pendingTransferParcels.length; i++) {
            if (pendingTransferParcels[i] == parcelId) {

                pendingTransferParcels[i] =
                    pendingTransferParcels[pendingTransferParcels.length - 1];

                pendingTransferParcels.pop();

                break;
            }
        }

        emit OwnershipTransferred(parcelId, oldOwner, newOwner, newCertificate);
    }

    function getOwnedParcels(address owner) external view returns (uint256[] memory)
    {
        return ownedParcels[owner];
    }

    function _removeOwnedParcel(address owner, uint256 parcelId) private{

        uint256[] storage parcels = ownedParcels[owner];

        for (uint256 i = 0; i < parcels.length; i++) {
            if (parcels[i] == parcelId) {
                // Move the last element into the current position
                parcels[i] = parcels[parcels.length - 1];

                // Remove the last element
                parcels.pop();

                return;
            }
        }

        revert("Parcel not found for owner");
    }

    // Verify certificate
    function verifyCertificate(uint256 parcelId, bytes32 certificateHash) external view returns (
        bool valid,
        address currentOwner,
        bytes32 currentCertificate,
        uint256 certificateVersion
    ) {
        require(properties[parcelId].exists, "Property not found.");

        Property storage property = properties[parcelId];

        valid = property.currentCertificate == certificateHash;
        currentOwner = property.currentOwner;
        currentCertificate = property.currentCertificate;
        certificateVersion = property.certificateVersion;

        return(
            valid,
            currentOwner,
            currentCertificate,
            certificateVersion
        );
    }

}