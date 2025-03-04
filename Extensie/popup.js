async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const loginContainer = document.getElementById("login-container");
    const containerLoginTitlu = document.getElementById("containertitlu");
    const sectiuneNoua = document.getElementById("sectiuneNoua");
    const logoutBtn = document.getElementById("logout-btn");

    chrome.storage.local.get(["accessToken"], function (result) {
        if (result.accessToken) {
            console.log("Utilizatorul este deja autentificat.");
            loginContainer.style.display = "none";
            containerLoginTitlu.style.display = "none";
            sectiuneNoua.style.display = "block";
        }
    });

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Previne reîncărcarea paginii

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Completează toate câmpurile!");
            return;
        }

        const hashedPassword = await hashPassword(password);
        console.log("Hashed password:", hashedPassword);

        const credentials = { Email: email, hashedPassword };
        try {
            const response = await fetch("http://localhost:9000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const responseFromServer = await response.json();
                const accessToken = responseFromServer.accessToken;
                chrome.storage.session.set({ accessToken }, () => {
                    console.log("Token salvat în chrome.storage");
                });

                loginContainer.style.display = "none";
                containerLoginTitlu.style.display = "none";
                sectiuneNoua.style.display = "block";
            } else {
                alert("Autentificare eșuată! Verifică datele introduse.");
            }
        } catch (error) {
            console.error("Eroare la autentificare:", error);
            alert("A apărut o eroare la conectare. Verifică rețeaua și încearcă din nou.");
        }
    });

    logoutBtn.addEventListener("click", function () {
        chrome.storage.local.remove(["accessToken"], function () {
            console.log("Utilizator delogat");
            location.reload();
        });
    });
});

function setAvatarInitials(firstName, lastName) {
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    const avatar = document.getElementById('avatar');
    avatar.textContent = initials;
}

const firstName = "Ion";
const lastName = "Popescu";
setAvatarInitials(firstName, lastName);


document.addEventListener("DOMContentLoaded", function () {
    const avatar = document.getElementById("avatar");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const logoutBtn = document.getElementById("logout-btn");

    // ✅ Afișează/ascunde meniul dropdown când avatarul este apăsat
    avatar.addEventListener("click", function () {
        dropdownMenu.classList.toggle("hidden");
    });

    // ✅ Logout - șterge token-ul și reîncarcă pagina
    logoutBtn.addEventListener("click", function () {
        chrome.storage.local.remove(["accessToken"], function () {
            console.log("Utilizator delogat");
            location.reload();
        });
    });

    // ✅ Închide meniul când dăm click în afara lui
    document.addEventListener("click", function (event) {
        if (!avatar.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });
});
// Funcție care afișează detaliile despre item

document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', function () {
        showItemDetails('Item 1');
    });
});
document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.example.com/items')
        .then(response => response.json())
        .then(data => {
            // Selectăm lista
            const favoriteList = document.getElementById('favorite-list');
            data.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('item');

                const span = document.createElement('span');
                span.style.color = 'white';
                span.style.fontSize = 'medium';
                span.textContent = item.name;

                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.gap = '10px';

                const launchIcon = document.createElement('img');
                launchIcon.src = item.launchIcon;
                launchIcon.alt = 'Launch';
                launchIcon.classList.add('launch');

                const garbageIcon = document.createElement('img');
                garbageIcon.src = item.garbageIcon;
                garbageIcon.alt = 'Garbage';
                garbageIcon.classList.add('garbage');

                div.appendChild(launchIcon);
                div.appendChild(garbageIcon);
                li.appendChild(span);
                li.appendChild(div);
                favoriteList.appendChild(li);
                li.addEventListener('click', function () {
                    showItemDetails(item.name);
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
function showItemDetails(itemName) {
    console.log('Item selectat:', itemName);
    document.getElementById('sectiuneNoua').style.display = 'none';
    document.getElementById('sectiuneDetalii').style.display = 'block';
    document.getElementById('item-title').textContent = 'Detalii despre: ' + itemName;
    document.getElementById('item-details').textContent = 'Aici vei găsi informații suplimentare despre ' + itemName + '.';
}
function goBack() {
    document.getElementById('sectiuneDetalii').style.display = 'none';
    document.getElementById('sectiuneNoua').style.display = 'block';
}
document.getElementById('back-btn').addEventListener('click', goBack);