import { connectWallet, getContract } from "./wallet.js";

const verifyBtn = document.getElementById("verifyBtn");

const parcelInput = document.getElementById("parcelId");
const hashInput = document.getElementById("certificateHash");

const verifyMessage = document.getElementById("verifyMessage");
const verifyResult = document.getElementById("verifyResult");

const verifyStatus = document.getElementById("verifyStatus");

const resultParcel = document.getElementById("resultParcel");
const resultOwner = document.getElementById("resultOwner");
const resultVersion = document.getElementById("resultVersion");
const resultDate = document.getElementById("resultDate");

verifyBtn.addEventListener("click", verifyCertificate);

async function verifyCertificate() {
  // Reset UI
  verifyMessage.textContent = "";
  verifyResult.classList.add("hidden");

  verifyStatus.textContent = "";
  resultParcel.textContent = "";
  resultOwner.textContent = "";
  resultVersion.textContent = "";
  resultDate.textContent = "";

  const parcelId = parcelInput.value.trim();
  const hash = hashInput.value.trim();

  if (!parcelId || !hash) {
    verifyMessage.textContent =
      "Please enter both Parcel ID and Certificate Hash.";
    return;
  }

  // Validate bytes32 hash
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    verifyMessage.textContent =
      "Certificate Hash must be a 32-byte hex string.";
    return;
  }

  verifyBtn.disabled = true;

  try {
    await connectWallet();

    const contract = getContract();

    const [valid, currentOwner, currentCertificate, certificateVersion] =
      await contract.verifyCertificate(parcelId, hash);

    console.log({
      parcelId,
      hash,
      valid,
      currentOwner,
      currentCertificate,
      certificateVersion,
    });

    if (!valid) {
      verifyStatus.textContent = "❌ Certificate Invalid";

      verifyMessage.textContent =
        "The supplied certificate hash does not match this parcel.";

      verifyResult.classList.remove("hidden");

      return;
    }

    const property = await contract.getProperty(parcelId);

    verifyStatus.textContent = "✅ Certificate Verified";

    resultParcel.textContent = property[0].toString();
    resultOwner.textContent = currentOwner;
    resultVersion.textContent = certificateVersion.toString();
    resultDate.textContent = new Date(
      Number(property[4]) * 1000,
    ).toLocaleString();

    verifyResult.classList.remove("hidden");
  } catch (error) {
    console.error(error);

    verifyMessage.textContent =
      error.reason ||
      error.shortMessage ||
      error.message ||
      "Verification failed.";
  } finally {
    verifyBtn.disabled = false;
  }
}
