// Handle home video click to navigate to work page
document.addEventListener('DOMContentLoaded', function() {
    const homeVideo = document.getElementById('homeVideo');

    if (homeVideo) {
        homeVideo.addEventListener('click', function() {
            window.location.href = 'work.html';
        });

        // Force-play the splash video on devices where autoplay needs a nudge
        // (Safari with Auto-Play "Never" / Low Power Mode / Save Data, etc.).
        // If play() rejects, hide the video element so the body's poster
        // background shows through instead of a blank black box.
        const video = homeVideo.querySelector('video');
        if (video) {
            const attemptPlay = () => video.play().catch(() => {
                video.style.display = 'none';
            });
            // Try immediately; if metadata isn't ready yet, retry once it is.
            attemptPlay();
            video.addEventListener('loadedmetadata', attemptPlay, { once: true });
            // Last resort: any user interaction on the page resumes playback.
            document.addEventListener('touchstart', attemptPlay, { once: true, passive: true });
            document.addEventListener('click', attemptPlay, { once: true });
        }
    }

    // Set dynamic header link based on current page
    const headerLogo = document.querySelector('.header-logo');

    if (headerLogo) {
        const currentPage = window.location.pathname;

        // If on work page, link to homepage; otherwise link to work page
        if (currentPage.includes('work')) {
            headerLogo.href = 'index.html';
        } else {
            headerLogo.href = 'work.html';
        }
    }

    // Lazy-load video thumbnails on the work page: starts paused with poster
    // visible, only loads the .mp4 when scrolled into view. Cuts initial
    // load from ~25MB of parallel video requests down to ~1MB of posters.
    const lazyVideos = document.querySelectorAll('video[data-src]');
    if (lazyVideos.length) {
        const loadVideo = (v) => {
            if (v.dataset.loaded === '1') return;
            v.dataset.loaded = '1';
            const src = v.dataset.src;
            // Inject a <source> child so existing markup pattern still works.
            const source = document.createElement('source');
            source.src = src;
            source.type = 'video/mp4';
            v.appendChild(source);
            v.load();
            v.play().catch(() => {});
        };
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadVideo(entry.target);
                        io.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '300px 0px' });
            lazyVideos.forEach((v) => io.observe(v));
        } else {
            // Old browsers — just load them all.
            lazyVideos.forEach(loadVideo);
        }
    }

    // Work/homepage grid: videos start paused on their poster still and only
    // play on hover, pausing and resetting back to the poster on mouse-leave.
    document.querySelectorAll('.grid-item').forEach((item) => {
        const video = item.querySelector('video');
        if (!video) return;
        let resetTimer;

        item.addEventListener('mouseenter', () => {
            clearTimeout(resetTimer);
            video.play().catch(() => {});
        });

        item.addEventListener('mouseleave', () => {
            video.pause();
            resetTimer = setTimeout(() => {
                video.currentTime = 0;
            }, 300);
        });
    });

    // Project page hero video: if autoplay is blocked, keep the poster visible
    // (so the user sees the still rather than nothing).
    const heroVideo = document.querySelector('.project-video video');
    if (heroVideo && heroVideo.muted) {
        heroVideo.play().catch(() => {});
    }

    // Project page keyboard nav: left/right arrows jump to prev/next project.
    const navRow = document.querySelector('.project-nav-row');
    if (navRow) {
        const prevLink = navRow.querySelector('a:first-child');
        const nextLink = navRow.querySelector('a:last-child');
        document.addEventListener('keydown', (e) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (lightboxOpen) return;
            if (e.key === 'ArrowLeft' && prevLink) {
                window.location.href = prevLink.href;
            } else if (e.key === 'ArrowRight' && nextLink) {
                window.location.href = nextLink.href;
            }
        });
    }

    // Stills lightbox: click a still to enlarge, flip through with
    // arrows/keyboard, click outside or Escape to close.
    const stillImages = Array.from(document.querySelectorAll('.project-stills img'));
    let lightboxOpen = false;

    if (stillImages.length) {
        let currentIndex = 0;

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-arrow lightbox-prev" aria-label="Previous still">&lsaquo;</button>
            <img class="lightbox-img" src="" alt="">
            <button class="lightbox-arrow lightbox-next" aria-label="Next still">&rsaquo;</button>
            <div class="lightbox-counter"></div>
        `;
        document.body.appendChild(overlay);

        const lightboxImg = overlay.querySelector('.lightbox-img');
        const counter = overlay.querySelector('.lightbox-counter');
        const closeBtn = overlay.querySelector('.lightbox-close');
        const prevBtn = overlay.querySelector('.lightbox-prev');
        const nextBtn = overlay.querySelector('.lightbox-next');

        const show = (index) => {
            currentIndex = (index + stillImages.length) % stillImages.length;
            lightboxImg.src = stillImages[currentIndex].src;
            lightboxImg.alt = stillImages[currentIndex].alt;
            counter.textContent = `${currentIndex + 1} / ${stillImages.length}`;
        };

        const open = (index) => {
            show(index);
            overlay.classList.add('active');
            lightboxOpen = true;
        };

        const close = () => {
            overlay.classList.remove('active');
            lightboxOpen = false;
        };

        stillImages.forEach((img, index) => {
            img.addEventListener('click', () => open(index));
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', () => show(currentIndex - 1));
        nextBtn.addEventListener('click', () => show(currentIndex + 1));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') show(currentIndex - 1);
            else if (e.key === 'ArrowRight') show(currentIndex + 1);
        });
    }
});
