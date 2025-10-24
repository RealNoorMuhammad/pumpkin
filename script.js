// ================================
// Toggle Mobile Menu
// ================================
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerMenu = document.getElementById('burgerMenu');

    mobileMenu.classList.toggle('active');
    burgerMenu.classList.toggle('active');
}

// ================================
// Copy CA to Clipboard
// ================================
function copyCA() {
    const caText = "0xcD27d168E12c97d4AcA2bdfe437f7cC2d8AB4444";
    const button = document.querySelector('.ca-copy-btn');

    navigator.clipboard.writeText(caText).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy CA. Please copy manually.');
    });
}

// ================================
// Global Mouse Glow Effect
// ================================
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    document.addEventListener('mousemove', (e) => {
        body.classList.add('glow-active');
        body.style.setProperty('--mouse-x', `${e.clientX}px`);
        body.style.setProperty('--mouse-y', `${e.clientY}px`);
    });

    document.addEventListener('mouseleave', () => {
        body.classList.remove('glow-active');
    });

    document.addEventListener('mouseenter', () => {
        body.classList.add('glow-active');
    });
});

// ================================
// Responsive Carousel Functionality
// ================================
let currentIndex = 0;
let autoScrollInterval;

// Dynamically calculate visible items based on screen width
function getVisibleVideos() {
    const width = window.innerWidth;
    if (width < 600) return 1;      // Mobile
    if (width < 1024) return 2;     // Tablet
    return 3;                       // Desktop
}

function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const item = document.querySelector('.carousel-item');
    if (!track || !item) return;

    const totalVideos = document.querySelectorAll('.carousel-item').length;
    const visibleVideos = getVisibleVideos();
    const maxIndex = totalVideos - visibleVideos;

    const itemWidth = item.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 20;

    // Update index
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = maxIndex;
    else if (currentIndex > maxIndex) currentIndex = 0;

    const translateX = -(currentIndex * (itemWidth + gap));
    track.style.transform = `translateX(${translateX}px)`;

    resetAutoScroll();
}

function autoScroll() {
    moveCarousel(1);
}

function resetAutoScroll() {
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(autoScroll, 3000);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        autoScrollInterval = setInterval(autoScroll, 3000);
        initializeVideos();
        setupHoverPause();
    }, 1000);

    // Recalculate carousel on window resize
    window.addEventListener('resize', () => {
        currentIndex = 0;
        moveCarousel(0);
    });
});

// Pause carousel on hover
function setupHoverPause() {
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
        card.addEventListener('mouseleave', () => resetAutoScroll());
    });
}

// ================================
// Volume Toggle for Videos
// ================================
function toggleVolume(button) {
    const videoWrapper = button.closest('.video-wrapper');
    const video = videoWrapper.querySelector('.tiktok-video');

    video.muted = !video.muted;
    button.classList.toggle('active');

    if (!video.muted && video.paused) {
        video.play();
    }
}

// ================================
// Video Initialization
// ================================
function initializeVideos() {
    const videos = document.querySelectorAll('.tiktok-video');

    videos.forEach(video => {
        video.muted = true;
        video.playsInline = true;

        // Click to play/pause
        video.addEventListener('click', function() {
            if (this.paused) {
                this.play().catch(e => console.log('Video play failed:', e));
            } else {
                this.pause();
            }
        });

        // Touch to play on mobile
        video.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (this.paused) {
                this.play().catch(e => console.log('Video play failed:', e));
            }
        });

        // Auto-play visible videos using IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.play().catch(e => console.log('Autoplay failed:', e));
                } else {
                    entry.target.pause();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(video);
    });
}
