// =============================================
// SITE DATA CONFIGURATION
// =============================================
const siteData = {
    brand: "APRILIANAFAST",
    contact: {
        phone: "087712748975",
        whatsapp: "6287712748975",
        email: "aprilianafajartok@gmail.com", // updated
        instagram: "@aprilianafast",
        address: "Klaten, Central Java"
    },
    // updated to Drive link so handlers can reuse it
    priceListUrl: "https://drive.google.com/file/d/1nc9CLnAqIk2jkO4FQq6gaxiN3dCOb4SK/view?usp=drive_link",
    // TODO: replace with your deployed Apps Script Web App URL (see Code.gs below)
    sheetUrl: "REPLACE_WITH_YOUR_WEB_APP_URL"
};

// =============================================
// DOM ELEMENTS
// =============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const backToTop = document.getElementById('backToTop');
const submitBtn = document.getElementById('submitBtn');

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (currentScroll > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }

    lastScroll = currentScroll;
});

// =============================================
// MOBILE MENU TOGGLE
// =============================================
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
});

// Close menu when clicking nav links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// =============================================
// SMOOTH SCROLL FOR NAVIGATION
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // use dynamic navbar height instead of fixed 80px
            const navHeight = navbar ? navbar.offsetHeight : 80;
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// =============================================
// BACK TO TOP BUTTON
// =============================================
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// =============================================
// CONTACT FORM SUBMISSION -> send to Google Sheet
// =============================================
// If submitBtn exists (form present), attach handler; otherwise skip
if (submitBtn) {
    submitBtn.removeEventListener?.('click', () => {}); // safe guard if reloaded in dev tools

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const reason = document.getElementById('reason').value;
        const message = document.getElementById('message').value.trim();

        // Validation (same as before)
        if (!firstName || !lastName || !email || !phone || !subject || !reason || !message) {
            showNotification('Mohon lengkapi semua field!', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Format email tidak valid!', 'error');
            return;
        }

        const phoneRegex = /^(08|628|\+628)[0-9]{8,12}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Format nomor telepon tidak valid!', 'error');
            return;
        }

        // Ensure sheetUrl is configured
        if (!siteData.sheetUrl || siteData.sheetUrl === 'REPLACE_WITH_YOUR_WEB_APP_URL') {
            showNotification('Sheet URL belum dikonfigurasi. Silakan deploy Apps Script dan masukkan URL ke siteData.sheetUrl', 'error');
            return;
        }

        // Prepare payload
        const payload = {
            timestamp: new Date().toISOString(),
            firstName,
            lastName,
            email,
            phone,
            subject,
            reason,
            message
        };

        try {
            // POST to Apps Script Web App
            const resp = await fetch(siteData.sheetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                mode: 'cors'
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const result = await resp.json().catch(() => ({}));
            // Show success
            showNotification('Terima kasih — data Anda telah terkirim.', 'success');

            // Clear form
            document.getElementById('firstName').value = '';
            document.getElementById('lastName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('subject').value = '';
            document.getElementById('reason').value = '';
            document.getElementById('message').value = '';

        } catch (err) {
            console.error('Sheet submit error:', err);
            showNotification('Gagal mengirim data. Silakan coba lagi atau hubungi via WhatsApp.', 'error');
        }
    });
}

// =============================================
// NOTIFICATION SYSTEM
// =============================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-in 2.7s;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success':
            return '✓';
        case 'error':
            return '✕';
        default:
            return 'ℹ';
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .notification-icon {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .notification-message {
        font-size: 0.95rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

// =============================================
// APPOINTMENT BUTTONS - WHATSAPP REDIRECT
// =============================================
const appointmentButtons = document.querySelectorAll('.btn-appointment, .btn-primary');

appointmentButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // If this is the Pricelist button, let it behave as a normal link (open Drive PDF)
        if (button.id === 'pricelistBtn') {
            return; // don't preventDefault, don't redirect to WhatsApp
        }

        e.preventDefault();
        
        const message = `Halo APRILIANAFAST, saya tertarik untuk booking makeup appointment. Mohon informasi lebih lanjut.`;
        const whatsappUrl = `https://wa.me/${siteData.contact.whatsapp}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        showNotification('Mengarahkan ke WhatsApp...', 'success');
    });
});

// =============================================
// SCROLL ANIMATIONS (AOS-like effect)
// =============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.hero-text, .hero-image, .about-image, .about-text, ' +
        '.service-card, .package-card, .testimonial-card, ' +
        '.section-header, .contact-info, .contact-form'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        el.style.transitionDelay = `${index * 0.05}s`;
        
        observer.observe(el);
    });
});

// Initialize gallery carousel (15 images, 3 per slide)
function initGalleryCarousel() {
    const track = document.querySelector('.gallery-carousel .carousel-track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.slide'));
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));

    let index = 0;
    let autoplayId = null;
    const slideCount = slides.length;

    function goTo(i) {
        index = (i + slideCount) % slideCount;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    nextBtn && nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); resetAutoplay(); });
    prevBtn && prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); resetAutoplay(); });

    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAutoplay(); }));

    // autoplay
    function startAutoplay() {
        stopAutoplay();
        autoplayId = setInterval(next, 5000);
    }
    function stopAutoplay() {
        if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
    }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    // touch / swipe
    let startX = 0;
    let deltaX = 0;
    const viewport = document.querySelector('.carousel-viewport');
    viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAutoplay(); }, {passive:true});
    viewport.addEventListener('touchmove', (e) => { deltaX = e.touches[0].clientX - startX; }, {passive:true});
    viewport.addEventListener('touchend', () => {
        if (Math.abs(deltaX) > 40) { if (deltaX < 0) next(); else prev(); }
        deltaX = 0;
        resetAutoplay();
    });

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement && ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement.tagName)) return;
        if (e.key === 'ArrowRight') { next(); resetAutoplay(); }
        if (e.key === 'ArrowLeft') { prev(); resetAutoplay(); }
    });

    // init
    goTo(0);
    startAutoplay();
}

// Wait for DOM ready and initialize
document.addEventListener('DOMContentLoaded', () => {
    initGalleryCarousel();

    // Attach click handlers for gallery images to open lightbox
    document.querySelectorAll('.gallery-img').forEach(img => {
        img.addEventListener('click', (e) => {
            const url = img.dataset.src || img.src;
            if (!url) return;
            openLightbox(url, img.alt || '');
        });
    });
});

// Lightbox functions
function openLightbox(url, alt = '') {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    if (!lb || !lbImg) return;
    lbImg.src = url;
    lbImg.alt = alt;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    // prevent body scroll while open
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    if (!lb || !lbImg) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    // allow body scroll after closing
    document.body.style.overflow = '';
    // clear src after short delay to free memory
    setTimeout(() => { lbImg.src = ''; lbImg.alt = ''; }, 300);
}

// Close lightbox on overlay click or close button
document.addEventListener('click', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    // close if clicking on overlay (outside content) or on close button
    if (e.target === lb || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
    }
});

// Close on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const lb = document.getElementById('lightbox');
        if (lb && lb.classList.contains('open')) closeLightbox();
    }
});

// =============================================
// ACTIVE NAV LINK ON SCROLL
// =============================================
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    // compute dynamic offset to match smooth scroll behavior
    const navHeight = navbar ? navbar.offsetHeight : 80;
    const scrollPosition = window.pageYOffset + navHeight + 20;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Add active link styles
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = `
    .nav-link.active {
        color: var(--primary-gold);
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(activeLinkStyle);

// =============================================
// LOADING ANIMATION
// =============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add fade-in animation to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// =============================================
// FORM INPUT ANIMATION
// =============================================
const formInputs = document.querySelectorAll('.form-input');

formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.style.transform = 'scale(1.02)';
        input.style.boxShadow = '0 4px 12px rgba(200, 168, 130, 0.2)';
    });

    input.addEventListener('blur', () => {
        input.style.transform = 'scale(1)';
        input.style.boxShadow = 'none';
    });
});

// =============================================
// PACKAGE CARD HOVER EFFECT
// =============================================
const packageCards = document.querySelectorAll('.package-card');

packageCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.cursor = 'pointer';
    });

    card.addEventListener('click', () => {
        const packageName = card.querySelector('.package-name').textContent;
        const packagePrice = card.querySelector('.package-price').textContent;
        
        const message = `Halo APRILIANAFAST, saya tertarik dengan ${packageName} (${packagePrice}). Mohon informasi lebih lanjut.`;
        const whatsappUrl = `https://wa.me/${siteData.contact.whatsapp}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        showNotification('Mengarahkan ke WhatsApp...', 'success');
    });
});

// =============================================
// CONSOLE INFO
// =============================================
console.log(`
╔═══════════════════════════════════════╗
║   APRILIANAFAST MAKEUP ARTIST         ║
║   Professional Hair & Makeup          ║
╠═══════════════════════════════════════╣
║   Contact: ${siteData.contact.phone}        ║
║   Instagram: ${siteData.contact.instagram}      ║
╚═══════════════════════════════════════╝
`);

// =============================================
// PREVENT CONTEXT MENU (Optional)
// =============================================
// Uncomment if you want to disable right-click
// document.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
// });

// =============================================
// KEYBOARD SHORTCUTS
// =============================================
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Ctrl + K to focus search (if added later)
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Focus on first form input
        document.querySelector('.form-input').focus();
    }
});

// =============================================
// PERFORMANCE OPTIMIZATION
// =============================================
// Lazy load images when implemented
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// =============================================
// READY STATE
// =============================================
console.log('✅ APRILIANAFAST Website Ready!');
console.log('📱 WhatsApp Integration: Active');
console.log('🎨 Smooth Animations: Loaded');
console.log('📧 Contact Form: Ready');