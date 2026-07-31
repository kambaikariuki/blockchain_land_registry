import { getContract } from "./wallet.js";


export async function loadHistory(parcelId) {

    const contract = getContract();

    const historyList =
        document.getElementById("historyList");


    historyList.innerHTML = "";

    const DEPLOYMENT_BLOCK = 11390393;
    const events =
        await contract.queryFilter(
            "OwnershipTransferred",
            DEPLOYMENT_BLOCK,
            "latest"
        );


    const parcelEvents =
        events.filter(
            event =>
                event.args.parcelId.toString()
                === parcelId.toString()
        );


    if(parcelEvents.length === 0){

        historyList.innerHTML =
        `
        <p>
        No ownership transfers recorded.
        </p>
        `;

        return;
    }


    parcelEvents.forEach(event => {


        const card =
        document.createElement("div");


        card.className =
        "history-card";


        card.innerHTML =
        `

        <p>
        <strong>Previous Owner:</strong><br>
        ${event.args.oldOwner}
        </p>


        <p>
        <strong>New Owner:</strong><br>
        ${event.args.newOwner}
        </p>

        `;

        historyList.appendChild(card);

    });

}