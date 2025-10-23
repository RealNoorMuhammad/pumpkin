// Toggle Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerMenu = document.getElementById('burgerMenu');
    
    mobileMenu.classList.toggle('active');
    burgerMenu.classList.toggle('active');
}

// Copy CA to clipboard function
function copyCA() {
    const caText = "0xcD27d168E12c97d4AcA2bdfe437f7cC2d8AB4444";
    const button = document.querySelector('.ca-copy-btn');
    
    // Copy to clipboard
    navigator.clipboard.writeText(caText).then(() => {
        // Change button text and style temporarily
        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        button.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy CA. Please copy manually.');
    });
}

// Global mouse glow effect
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    
    // Activate glow and track mouse position
    document.addEventListener('mousemove', (e) => {
        body.classList.add('glow-active');
        
        // Update position relative to viewport (fixed positioning)
        body.style.setProperty('--mouse-x', `${e.clientX}px`);
        body.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
    
    // Deactivate glow when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        body.classList.remove('glow-active');
    });
    
    // Reactivate when mouse enters
    document.addEventListener('mouseenter', () => {
        body.classList.add('glow-active');
    });
});

// Carousel functionality
let currentIndex = 0;
let autoScrollInterval;
const totalVideos = 8;
const visibleVideos = 3;
const maxIndex = totalVideos - visibleVideos;

function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const item = document.querySelector('.carousel-item');
    const itemWidth = item.getBoundingClientRect().width;
    const gap = 20;
    
    // Update index
    currentIndex += direction;
    
    // Wrap around logic
    if (currentIndex < 0) {
        currentIndex = maxIndex;
    } else if (currentIndex > maxIndex) {
        currentIndex = 0;
    }
    
    // Calculate and apply transform with proper rounding
    const translateX = Math.round(-(currentIndex * (itemWidth + gap)));
    track.style.transform = `translateX(${translateX}px)`;
    
    // Reset auto-scroll interval
    resetAutoScroll();
}

function autoScroll() {
    moveCarousel(1);
}

function resetAutoScroll() {
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(autoScroll, 2000);
}

// Initialize auto-scroll when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Start auto-scroll after videos load
    setTimeout(() => {
        autoScrollInterval = setInterval(autoScroll, 2000);
        initializeVideos();
        setupHoverPause();
    }, 1000);
});

// Setup hover pause for individual video cards
function setupHoverPause() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });
        
        card.addEventListener('mouseleave', () => {
            resetAutoScroll();
        });
    });
}

// Volume toggle function
function toggleVolume(button) {
    const videoWrapper = button.closest('.video-wrapper');
    const video = videoWrapper.querySelector('.tiktok-video');
    
    // Toggle muted state
    video.muted = !video.muted;
    
    // Toggle active class on button
    button.classList.toggle('active');
    
    // If unmuting, ensure video is playing
    if (!video.muted && video.paused) {
        video.play();
    }
}

// Video functionality
function initializeVideos() {
    const videos = document.querySelectorAll('.tiktok-video');
    
    videos.forEach(video => {
        // Ensure videos are muted for autoplay
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
        
        // Auto-play visible videos (muted)
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
