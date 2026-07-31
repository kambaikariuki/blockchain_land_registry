import { getContract, getAccount } from "./wallet.js";

const ownerSection = document.getElementById("ownerSection");
const registrarSection = document.getElementById("registrarSection");
const propertyList = document.getElementById("propertyList");

const transferModal = document.getElementById("transferModal");
const transferParcelId = document.getElementById("transferParcelId");
const buyerAddress = document.getElementById("buyerAddress");

const cancelTransfer = document.getElementById("cancelTransfer");

const submitTransfer = document.getElementById("submitTransfer");

let selectedParcel = null;

export async function showOwner() {
  ownerSection.classList.remove("hidden");
  registrarSection.classList.add("hidden");

  propertyList.innerHTML = "";

  try {
    const contract = getContract();
    const account = await getAccount();

    const parcelIds = await contract.getOwnedParcels(account);

    if (parcelIds.length === 0) {
      propertyList.innerHTML = `
                <p>You don't own any registered properties.</p>
            `;
      return;
    }

    for (const parcelId of parcelIds) {
      const property = await contract.getProperty(parcelId);

      const card = document.createElement("div");
      card.className = "property-card";

      card.innerHTML = `
                <h3>Parcel ID: ${property[0].toString()}</h3>

                <p><strong>Owner:</strong> ${property[1]}</p>

                <p><strong>Certificate Version:</strong>
                    ${property[3].toString()}
                </p>

                <p><strong>Date Registered:</strong>
                    ${new Date(Number(property[4]) * 1000).toLocaleString()}
                </p>

                <button class="transfer-btn"
                        data-parcel="${property[0].toString()}">
                    Request Transfer
                </button>
            `;

      propertyList.appendChild(card);
      const transferButton = card.querySelector(".transfer-btn");

      transferButton.addEventListener("click", () => {
        selectedParcel = property[0].toString();

        transferParcelId.textContent = selectedParcel;

        buyerAddress.value = "";

        transferModal.classList.remove("hidden");
      });
    }
  } catch (error) {
    console.error(error);

    propertyList.innerHTML = `
            <p>Failed to load properties.</p>
        `;
  }
}

transferModal.addEventListener("click", (e) => {
  if (e.target === transferModal) {
    transferModal.classList.add("hidden");
  }
});

cancelTransfer.addEventListener("click", () => {
  transferModal.classList.add("hidden");

  selectedParcel = null;

  buyerAddress.value = "";
});

submitTransfer.addEventListener("click", async () => {
  if (!selectedParcel) {
    alert("No parcel selected.");
    return;
  }

  if (buyerAddress.value.trim() === "") {
    alert("Please enter the buyer's address.");
    return;
  }

  try {
    const contract = getContract();

    const tx = await contract.requestTransfer(
      selectedParcel,
      buyerAddress.value.trim(),
    );

    await tx.wait();

    transferModal.classList.add("hidden");

    selectedParcel = null;

    buyerAddress.value = "";

    await showOwner();

    alert("Transfer request submitted successfully.");
  } catch (error) {
    console.error(error);

    alert(error.reason || error.message);
  }
});
