# Blockchain Land Registry

A decentralized land registry application built on Ethereum that enables secure property registration, ownership transfers, and certificate verification using blockchain technology.

## Overview

The Blockchain Land Registry is a decentralized application (dApp) designed to improve transparency, security, and trust in land ownership management. Instead of relying on centralized databases, property records are stored on the Ethereum blockchain, making them tamper-resistant and publicly verifiable.

The application allows authorized registrars to register land parcels, property owners to request ownership transfers, and anyone to verify land ownership certificates through a simple web interface.

## Features

- Connect using MetaMask
- Register new land parcels (Registrar only)
- Search registered properties
- View current property owner
- Verify certificate authenticity using a certificate hash
- Request ownership transfers
- Registrar approval workflow for transfers
- View ownership history
- Responsive web interface
- Deployed on the Ethereum Sepolia Test Network

## Technologies Used

### Smart Contract

- Solidity
- OpenZeppelin Contracts
- Hardhat

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Ethers.js

### Blockchain and wallet integration

- Ethereum Sepolia Testnet
- MetaMask

## Smart Contract Features

The smart contract manages all blockchain operations, including:

- Property registration
- Ownership records
- Certificate generation
- Certificate verification
- Ownership transfers
- Transfer approval
- Ownership history through blockchain events

## Application Pages

### Home

The landing page allows users to:

- Search for a property using its Parcel ID
- View property details
- View certificate information
- View ownership transfer history

### Dashboard

The dashboard supports two roles.

#### Registrar

- Register new properties
- View pending transfer requests
- Approve ownership transfers

#### Property Owner

- View owned properties
- Request ownership transfers
- Transfer property to another Ethereum wallet

### Verify Certificate

Users can verify ownership certificates by entering:

- Parcel ID
- Certificate Hash

The application compares the submitted hash against the blockchain record and displays whether the certificate is valid.

### Installation

Clone the repository and install the project dependencies.

`git clone https://github.com/kambaikariuki/alu-logo.git`

`cd <project-folder>`

`npm install`

Compile the Contracts

`npx hardhat compile`

Run the Automated Tests

`npx hardhat test`

#### 1. Local Deployment

1. Configure `hardhat.config.js`:

```

require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {

    solidity: "0.8.28",

};
```

2. Run a local blockchain network

`npx hardhat node`

3. Deploy the Contracts

`npx hardhat run scripts/deploy.js --network localhost`

#### 2. Deploying to Sepolia

1. Get a wallet

Get a MetaMask wallet and copy its public address.

2. Get Sepolia test ETH

You'll need test ETH to pay deployment gas.

Popular faucets include:

Alchemy Sepolia Faucet
Infura Sepolia Faucet

Request test ETH to your MetaMask address.

3. Get an RPC URL

Create a free account with either:

Alchemy
Infura

Create a Sepolia application and copy the HTTPS RPC URL.

It looks similar to:

`https://eth-sepolia.g.alchemy.com/v2/xxxxxxxx`

4. Install dotenv

`npm install dotenv`

5. Create `.env` file

In your project root:

`SEPOLIA_RPC_URL=https://your-rpc-url`

`PRIVATE_KEY=your_private_key`

Add to `.env` to `.gitignore`

6. Configure Hardhat

   ````require("@nomicfoundation/hardhat-toolbox");
   require("dotenv").config();

   module.exports = {

       solidity: "0.8.28",

       networks: {

           sepolia: {

               url: process.env.SEPOLIA_RPC_URL,

               accounts: [
                   process.env.PRIVATE_KEY
               ]

           }

       }

   };```

   ````

7. Compile

`npx hardhat compile`

8. Deploy

`npx hardhat run scripts/deploy.js --network sepolia`

### Frontend

For the frontend, change directory to the `frontend` directory and initalize a server on port 8000:

`python -m http.server 8000`

Open your browser and go to `localhost:8000` or `127.0.0.1:8000` to access the frontend.

#### Note:

If deployed locally, in `frontend/js/wallet.js`, comment out line 10:

`// const DEPLOYMENT_BLOCK = 11390393;`

And replace `DEPLOYMENT_BLOCK` with `0` :

```
  const events = await contract.queryFilter(
    "OwnershipTransferred",
    0,
    "latest",
  );
```

If deployed on Sepolia or another testnet, replace the value of `DEPLOYMENT_BLOCK` with the deployment block of your contract:
`const DEPLOYMENT_BLOCK = 11390393;`

```
  const events = await contract.queryFilter(
    "OwnershipTransferred",
    DEPLOYMENT_BLOCK,
    "latest",
  );
```

This will allow you to view the transaction history of each parcel.
