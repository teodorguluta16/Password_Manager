import { setAvatarInitials, initAccountDropdown } from "./contulmeu.js"
import { afiseazaParole, goBack, cautaParola } from "./detaliiItem.js";
import { comutareFerestreUI } from "./comutareUIsectiunui.js"
import { handleCreareItem } from "./adaugareItem.js";
import { initAutentificare } from "./authSectiune.js";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let paroleDecriptate = [];

// autentificare
(async () => {
    const parole = await initAutentificare();
    if (parole) {
        paroleDecriptate = parole;
        console.log("✅ paroleDecriptate disponibile:", paroleDecriptate);
    }
})();

// avatar cont cu meniu
const firstName = "Ion";
const lastName = "Popescu";
setAvatarInitials(firstName, lastName);
initAccountDropdown();

// buton de back pt cand selectez un item sa-i vad detaliile
document.getElementById('back-btn').addEventListener('click', goBack);

// vizualizare lista parole
document.addEventListener("DOMContentLoaded", function () {
    browserAPI.runtime.sendMessage({ action: "getPasswords" }, (response) => {
        if (response.success) {
            console.log("Parolele primite în popup.js:", response.passwords);
            afiseazaParole(response.passwords);
        } else {
            console.error("Eroare la primirea parolelor:", response.error);
        }
    });
});

// cautare item
document.getElementById("search-box").addEventListener("input", function () {
    const cautare = this.value;
    const paroleGasite = cautaParola(cautare, paroleDecriptate);
    afiseazaParole(paroleGasite);
});

// back Item Nou
comutareFerestreUI();

// adaugare Item
const creareForm = document.getElementById('creare-form');
handleCreareItem(creareForm);

