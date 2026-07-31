import { loadHistory } from "./history.js";
import { connectWallet, getContract } from "./wallet.js";

const searchBtn = document.getElementById("searchBtn");
const searchParcelId = document.getElementById("parcelId");

const searchResult = document.getElementById("searchResult");
const searchMessage = document.getElementById("searchMessage");

const resultParcelId = document.getElementById("parcel");
const resultOwner = document.getElementById("owner");
const resultVersion = document.getElementById("version");
const resultDate = document.getElementById("registered");
const resultHash = document.getElementById("certificateHash");

searchBtn.addEventListener("click", searchProperty);

async function searchProperty() {
  searchMessage.textContent = "";
  searchResult.classList.add("hidden");

  const parcelId = searchParcelId.value.trim();

  if (parcelId === "") {
    searchMessage.textContent = "Please enter a parcel ID.";
    return;
  }

  try {
    // Connect wallet if not already connected.
    await connectWallet();

    const contract = getContract();

    console.log("Contract:", contract.address);

    const property = await contract.getProperty(parcelId);

    resultParcelId.textContent = property[0].toString();

    resultOwner.textContent = property[1];

    resultVersion.textContent = property[3].toString();

    resultDate.textContent = new Date(
      Number(property[4]) * 1000,
    ).toLocaleString();

    // bytes32 certificate hash
    resultHash.textContent = property[2];

    await loadHistory(parcelId);

    searchResult.classList.remove("hidden");

  } catch (error) {
    console.error(error);

    searchMessage.textContent = "Property not found.";
  }
}
