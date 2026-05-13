// Header scroll effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Appointment Form Logic
const appointmentForm = document.getElementById('appointmentForm');

if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const treatment = document.getElementById('treatment').value;
        
        // WhatsApp number and message formatting
        const whatsappNumber = "919011302935";
        const message = `Hello Doctor, I want to book an appointment.%0A%0A*Patient Details:*%0AName: ${name}%0APhone: ${phone}%0ATreatment: ${treatment}`;
        
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        // Open WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Optional: Reset form
        appointmentForm.reset();
    });
}

// Reveal animations on scroll
const revealElements = document.querySelectorAll('.service-card, .trust-item, .gallery-item, .hero-content, .hero-image');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.8;
    
    revealElements.forEach(el => {
        const elTop = el.getBoundingClientRect().top;
        
        if (elTop < triggerBottom) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
};

// Initial setup for reveal elements
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
});

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Run once on load

// Mobile Menu Toggle (Simplified for this premium design)
// In a full implementation, we'd add a hamburger menu. 
// For now, the sticky call and floating whatsapp handle the primary mobile CTAs.
// --- DYNAMIC GALLERY FETCH ---
const API_URL = 'http://localhost:8080/api';

async function loadGallery() {
    const galleryContainer = document.getElementById('dynamicGallery');
    if (!galleryContainer) return; // Exit if we aren't on the main page

    try {
        const response = await fetch(`${API_URL}/gallery`);
        const images = await response.json();

        // Clear the "Loading..." text
        galleryContainer.innerHTML = '';

        if (images.length === 0) {
            galleryContainer.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">New transformations coming soon!</p>';
            return;
        }

        // Loop through the database records and build HTML for each one
        images.forEach(item => {
            const card = document.createElement('div');
            card.className = 'result-card'; // Uses the CSS you already have
            
            card.innerHTML = `
                <h3 style="text-align: center; margin-bottom: 1rem; font-size: 1.25rem; color: var(--primary);">${item.title}</h3>
                <div class="result-images" style="display: flex; gap: 1rem;">
                    <div class="img-box" style="flex: 1; position: relative;">
                        <span class="badge" style="position: absolute; top: 10px; left: 10px; background: var(--text-dark); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; z-index: 2; font-weight: bold;">Before</span>
                        <img src="${item.beforeImageUrl}" alt="Before ${item.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0;">
                    </div>
                    <div class="img-box" style="flex: 1; position: relative;">
                        <span class="badge" style="position: absolute; top: 10px; left: 10px; background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; z-index: 2; font-weight: bold;">After</span>
                        <img src="${item.afterImageUrl}" alt="After ${item.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0;">
                    </div>
                </div>
            `;
            
            galleryContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        galleryContainer.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; color: red;">Failed to load gallery images.</p>';
    }
}

// Fire the function when the page finishes loading
document.addEventListener('DOMContentLoaded', loadGallery);