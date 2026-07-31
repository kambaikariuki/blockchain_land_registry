import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";
import { CONTRACT_ADDRESS, ABI } from "./config.js";

let provider = null;
let signer = null;
let contract = null;

/**
 * Connect to MetaMask and initialize the contract.
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  // Request wallet connection

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: "0x7a69",
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }

  provider = new BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
  const network = await provider.getNetwork();

  if (network.chainId !== 31337n) {
    throw new Error("Please switch MetaMask to the Hardhat Localhost network.");
  }

  return await signer.getAddress();
}

/**
 * Returns the connected account.
 */
export async function getAccount() {
  if (!signer) {
    throw new Error("Wallet not connected.");
  }

  return await signer.getAddress();
}

/**
 * Returns the ethers provider.
 */
export function getProvider() {
  return provider;
}

/**
 * Returns the signer.
 */
export function getSigner() {
  return signer;
}

/**
 * Returns the contract instance.
 */
export function getContract() {
  if (!contract) {
    throw new Error("Wallet not connected.");
  }

  return contract;
}

/**
 * Checks if MetaMask is installed.
 */
export function isMetaMaskInstalled() {
  return typeof window.ethereum !== "undefined";
}

/**
 * Disconnect locally.
 * (MetaMask itself does not support programmatic disconnect.)
 */
export function disconnectWallet() {
  provider = null;
  signer = null;
  contract = null;
}

export async function isRegistrar() {
  if (!contract) {
    throw new Error("Wallet not connected.");
  }

  const account = await getAccount();

  return await contract.isRegistrar(account);
}
