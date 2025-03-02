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
function showItemDetails(itemName) {
    console.log('Item selectat:', itemName); // Verifică dacă se face click

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