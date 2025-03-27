export function comutareFerestreUI() {
    const plusBtn = document.getElementById('plus-button');
    const sectiuneNoua = document.getElementById('sectiuneNoua');
    const sectiuneDetalii = document.getElementById('sectiuneDetalii');
    const sectiuneCreareItem = document.getElementById('sectiuneCreareItem');
    const backFromCreateBtn = document.getElementById('back-from-create-btn');

    if (plusBtn && sectiuneNoua && sectiuneDetalii && sectiuneCreareItem && backFromCreateBtn) {
        plusBtn.addEventListener('click', () => {
            sectiuneNoua.style.display = 'none';
            sectiuneDetalii.style.display = 'none';
            sectiuneCreareItem.style.display = 'block';
        });

        backFromCreateBtn.addEventListener('click', () => {
            sectiuneCreareItem.style.display = 'none';
            sectiuneNoua.style.display = 'block';
        });
    } else {
        console.warn("⚠️ Unele elemente UI nu au fost găsite pentru toggle.");
    }
}
