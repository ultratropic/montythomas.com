// Handle home video click to navigate to work page
document.addEventListener('DOMContentLoaded', function() {
    const homeVideo = document.getElementById('homeVideo');

    if (homeVideo) {
        homeVideo.addEventListener('click', function() {
            window.location.href = 'work.html';
        });
    }

    // Set dynamic header link based on current page
    const headerLogo = document.querySelector('.header-logo');

    if (headerLogo) {
        const currentPage = window.location.pathname;

        if (currentPage.includes('work.html')) {
            headerLogo.href = 'index.html';
        } else {
            headerLogo.href = 'work.html';
        }
    }
});
