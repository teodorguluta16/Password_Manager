export function setAvatarInitials(firstName, lastName) {
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    const avatar = document.getElementById('avatar');
    avatar.textContent = initials;
}

export function initAccountDropdown() {
    document.addEventListener("DOMContentLoaded", function () {
        const avatar = document.getElementById("avatar");
        const dropdownMenu = document.getElementById("dropdown-menu");
        const logoutBtn = document.getElementById("logout-btn");

        avatar.addEventListener("click", function () {
            dropdownMenu.classList.toggle("hidden");
        });

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
        document.addEventListener("click", function (event) {
            if (!avatar.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add("hidden");
            }
        });
    });
}
