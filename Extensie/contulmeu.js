export function setAvatarInitials(firstName, lastName) {
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    const avatar = document.getElementById('avatar');
    avatar.textContent = initials;
}

export function initAccountDropdown() {
    document.addEventListener("DOMContentLoaded", async function () {
        const avatar = document.getElementById("avatar");
        const avatarInitiale = document.getElementById("avatar-initiale");
        const userNume = document.getElementById("user-nume");
        const userEmail = document.getElementById("user-email");
        const dropdownMenu = document.getElementById("dropdown-menu");
        const logoutBtn = document.getElementById("logout-btn");

        // 👤 Obține detaliile utilizatorului
        try {
            const response = await fetch("http://localhost:9000/api/getEmail", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const { email, nume, prenume } = await response.json();

                userNume.textContent = `${prenume} ${nume}`;
                userEmail.textContent = email;

                const initiale = `${prenume?.charAt(0) ?? ""}${nume?.charAt(0) ?? ""}`;
                if (avatarInitiale) avatarInitiale.textContent = initiale.toUpperCase();
            } else {
                console.warn("Nu s-au putut obține datele utilizatorului.");
            }
        } catch (err) {
            console.error("Eroare la preluarea datelor utilizatorului:", err);
        }

        // 📌 Deschide/închide meniul
        avatar.addEventListener("click", function () {
            dropdownMenu.classList.toggle("hidden");
        });

        // 🔐 Delogare
        logoutBtn.addEventListener("click", async function () {
            try {
                await fetch("http://localhost:9000/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });

                console.log("Utilizator delogat");
                location.reload();
            } catch (error) {
                console.error("Eroare la delogare:", error);
            }
        });

        // 🧼 Închidere dropdown dacă se apasă în afara lui
        document.addEventListener("click", function (event) {
            if (!avatar.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add("hidden");
            }
        });
    });
}

