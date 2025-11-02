
const main = () => {
    const openMenuBtn = document.getElementById('open-menu');
    const drawerBlock = document.querySelector('.drawer-block');
    const closeMenuBtn = document.getElementById('close-menu');

    openMenuBtn.addEventListener('click', () => {
        drawerBlock.classList.toggle('active');
    });

    // drawerBlock.addEventListener('click', () => {
    //     drawerBlock.classList.remove('active');
    // });

    closeMenuBtn.addEventListener('click', () => {
        drawerBlock.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', main);