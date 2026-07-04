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

    // Project page hero video: if autoplay is blocked, keep the poster visible
    // (so the user sees the still rather than nothing).
    const heroVideo = document.querySelector('.project-video video');
    if (heroVideo) {
        heroVideo.play().catch(() => {});
    }

    // Prev/next nav arrows are fixed (so they don't scroll away), but need to
    // line up with the video's actual vertical center, which varies by aspect
    // ratio. Measure the rendered video and pin the arrows' fixed top in px.
    const projectVideoEl = document.querySelector('.project-video');
    const projectNavEls = document.querySelectorAll('.project-nav');
    if (projectVideoEl && projectNavEls.length) {
        const positionProjectNav = () => {
            const rect = projectVideoEl.getBoundingClientRect();
            const centerY = rect.top + window.scrollY + rect.height / 2;
            projectNavEls.forEach((el) => {
                el.style.top = centerY + 'px';
            });
        };
        positionProjectNav();
        window.addEventListener('resize', positionProjectNav);
        if (heroVideo) {
            heroVideo.addEventListener('loadedmetadata', positionProjectNav, { once: true });
        }
    }
});
