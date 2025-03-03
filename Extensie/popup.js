document.getElementById('login-btn').addEventListener('click', function (event) {
    event.preventDefault(); // Previne comportamentul implicit al formularului (evită reîncărcarea paginii)

    // Ascundem formularul de login
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('containertitlu').style.display = 'none';

    // Afișăm secțiunea nouă
    document.getElementById('sectiuneNoua').style.display = 'block';
});

// Funcție pentru setarea inițialelor în avatar
function setAvatarInitials(firstName, lastName) {
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    const avatar = document.getElementById('avatar');
    avatar.textContent = initials;
}

// Exemplu de utilizator cu nume și prenume
const firstName = "Ion";  // Înlocuiește cu numele real
const lastName = "Popescu";  // Înlocuiește cu prenumele real
setAvatarInitials(firstName, lastName);

// Funcție care afișează detaliile despre item

document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', function () {
        showItemDetails('Item 1');
    });
});
document.addEventListener('DOMContentLoaded', function () {
    // Exemplu de apel API pentru a obține datele (poți înlocui cu URL-ul real al serverului)
    fetch('https://api.example.com/items')  // Înlocuiește cu adresa reală a serverului
        .then(response => response.json())  // Parseați răspunsul ca JSON
        .then(data => {
            // Selectăm lista
            const favoriteList = document.getElementById('favorite-list');

            // Iterăm prin datele primite de la server și construim fiecare item
            data.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('item');

                const span = document.createElement('span');
                span.style.color = 'white';
                span.style.fontSize = 'medium';
                span.textContent = item.name;  // Setăm numele itemului

                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.gap = '10px';

                const launchIcon = document.createElement('img');
                launchIcon.src = item.launchIcon;  // Setăm sursa iconiței Launch
                launchIcon.alt = 'Launch';
                launchIcon.classList.add('launch');

                const garbageIcon = document.createElement('img');
                garbageIcon.src = item.garbageIcon;  // Setăm sursa iconiței Garbage
                garbageIcon.alt = 'Garbage';
                garbageIcon.classList.add('garbage');

                // Adăugăm imagini în div
                div.appendChild(launchIcon);
                div.appendChild(garbageIcon);

                // Adăugăm span și div în li
                li.appendChild(span);
                li.appendChild(div);

                // Adăugăm itemul la lista de favorite
                favoriteList.appendChild(li);

                // Adăugăm eveniment de click pentru fiecare item
                li.addEventListener('click', function () {
                    showItemDetails(item.name);
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Funcția care afișează detaliile despre item
function showItemDetails(itemName) {
    console.log('Item selectat:', itemName);

    // Ascunde secțiunea curentă
    document.getElementById('sectiuneNoua').style.display = 'none';

    // Afișează secțiunea de detalii
    document.getElementById('sectiuneDetalii').style.display = 'block';

    // Schimbă titlul și detaliile în funcție de item
    document.getElementById('item-title').textContent = 'Detalii despre: ' + itemName;
    document.getElementById('item-details').textContent = 'Aici vei găsi informații suplimentare despre ' + itemName + '.';
}

// Funcție care permite navigarea înapoi la secțiunea principală
function goBack() {
    // Ascunde secțiunea de detalii
    document.getElementById('sectiuneDetalii').style.display = 'none';

    // Arată secțiunea principală
    document.getElementById('sectiuneNoua').style.display = 'block';
}

// Așteaptă click-ul pe butonul de înapoi
document.getElementById('back-btn').addEventListener('click', goBack);