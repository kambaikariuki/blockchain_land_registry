import { getContract } from "./wallet.js";

const registerBtn = document.getElementById("registerBtn");
const status = document.getElementById("registerStatus");

registerBtn.addEventListener("click", registerProperty);

export async function showRegistrar() {
  registrarSection.classList.remove("hidden");
  ownerSection.classList.add("hidden");
  await loadPendingTransfers();
}

async function registerProperty() {
  const parcelId = document.getElementById("parcelId").value;
  const ownerAddress = document.getElementById("ownerAddress").value;

  const contract = getContract();

  try {
    status.textContent = "Registering property...";

    const tx = await contract.registerProperty(
      parcelId,
      ownerAddress,
      // any other parameters your Solidity function requires
    );

    await tx.wait();

    status.textContent = "Property registered successfully.";
  } catch (error) {
    console.error(error);
    status.textContent = error.reason || error.message;
  }
}

const pendingTransfers = document.getElementById("pendingTransfers");

export async function loadPendingTransfers() {
  pendingTransfers.innerHTML = "";

  try {
    const contract = getContract();

    const parcelIds = await contract.getPendingTransfers();

    if (parcelIds.length === 0) {
      pendingTransfers.innerHTML = "<p>No pending transfer requests.</p>";

      return;
    }

    for (const parcelId of parcelIds) {
      const request = await contract.getTransferRequest(parcelId);

      const property = await contract.getProperty(parcelId);

      const card = document.createElement("div");

      card.className = "property-card";

      card.innerHTML = `
                <h3>Parcel ${parcelId}</h3>

                <p><strong>Current Owner:</strong></p>
                <p>${request[0]}</p>

                <p><strong>New Owner:</strong></p>
                <p>${request[1]}</p>

                <p><strong>Requested:</strong></p>
                <p>${new Date(Number(request[2]) * 1000).toLocaleString()}</p>

                <button
                    class="approve-btn"
                    data-parcel="${parcelId}">
                    Approve Transfer
                </button>
            `;

      pendingTransfers.appendChild(card);

      const approveButton = card.querySelector(".approve-btn");

      approveButton.addEventListener("click", async () => {
        try {
          const tx = await contract.approveTransfer(parcelId);

          await tx.wait();

          alert("Transfer approved.");

          await loadPendingTransfers();
        } catch (error) {
          console.error(error);

          alert(error.reason || error.shortMessage || error.message);
        }
      });
    }
  } catch (error) {
    console.error(error);

    pendingTransfers.innerHTML = "<p>Failed to load pending transfers.</p>";
  }
}
