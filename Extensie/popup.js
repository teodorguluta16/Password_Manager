import { setAvatarInitials, initAccountDropdown } from "./contulmeu.js"
import { afiseazaParole, goBack, cautaParola } from "./detaliiItem.js";
import { comutareFerestreUI } from "./comutareUIsectiunui.js"
import { handleCreareItem } from "./adaugareItem.js";
import { verificaAutentificare, setupFormularAutentificare } from "./authSectiune.js";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let paroleDecriptate = [];

document.addEventListener("DOMContentLoaded", async function () {

    // 1. Așteaptă autentificarea completă
    paroleDecriptate = await verificaAutentificare();


    if (paroleDecriptate) {
        console.log("Utilizator deja logat.");
        afiseazaParole(paroleDecriptate);
        document.getElementById("login-container").style.display = "none";
        document.getElementById("containertitlu").style.display = "none";
        document.getElementById("sectiuneNoua").style.display = "block";
    } else {
        setupFormularAutentificare(); // doar dacă nu e logat deja
    }

    // 2. Inițializează căutarea
    document.getElementById("search-box").addEventListener("input", function () {
        const cautare = this.value;
        const paroleGasite = cautaParola(cautare, paroleDecriptate);
        afiseazaParole(paroleGasite);
    });



    document.body.style.visibility = "visible";
});

// 3. Cere parolele din storage
browserAPI.runtime.sendMessage({ action: "getPasswords" }, (response) => {
    if (response.success) {
        console.log("Parolele primite în popup.js:", response.passwords);
        //afiseazaParole(response.passwords);
    } else {
        console.error("Eroare la primirea parolelor:", response.error);
    }
});

// avatar cont cu meniu
const firstName = "Ion";
const lastName = "Popescu";
setAvatarInitials(firstName, lastName);
initAccountDropdown();

// buton de back pt cand selectez un item sa-i vad detaliile
document.getElementById('back-btn').addEventListener('click', goBack);

// back Item Nou
comutareFerestreUI();

// adaugare Item
const creareForm = document.getElementById('creare-form');
handleCreareItem(creareForm);

