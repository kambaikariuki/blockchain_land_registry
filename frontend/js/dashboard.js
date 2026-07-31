import { connectWallet, getAccount, isRegistrar } from "./wallet.js";
import { showOwner } from "./owner.js";
import { showRegistrar } from "./registrar.js";

const connectButton = document.getElementById("connectBtn");
const registrarSection = document.getElementById("registrarSection");
const ownerSection = document.getElementById("ownerSection");

connectButton.addEventListener("click", async () => {
  try {
    const address = await connectWallet();

    const registrar = await isRegistrar();

    if (registrar) {
      showRegistrar();
    } else {
      showOwner();
    }

    document.getElementById("walletId").textContent = address;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});
