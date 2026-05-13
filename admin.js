// admin.js
const API_URL = 'http://localhost:8080/api';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const uploadForm = document.getElementById('uploadForm');
const uploadStatus = document.getElementById('uploadStatus');
const logoutBtn = document.getElementById('logoutBtn');
const uploadBtn = document.getElementById('uploadBtn');

// Check if already logged in on page load
let token = localStorage.getItem('adminToken');
if (token) {
    showDashboard();
}

// --- LOGIN LOGIC ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    loginError.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            showDashboard();
        } else {
            loginError.style.display = 'block';
            loginError.innerText = data.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error logging in:', error);
        loginError.style.display = 'block';
        loginError.innerText = 'Server error. Is the backend running?';
    }
});

// --- UPLOAD LOGIC ---
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    uploadBtn.innerText = 'Uploading... Please wait';
    uploadBtn.disabled = true;
    uploadStatus.innerText = '';

    const formData = new FormData();
    formData.append('title', document.getElementById('treatmentTitle').value);
    formData.append('beforeImage', document.getElementById('beforeImage').files[0]);
    formData.append('afterImage', document.getElementById('afterImage').files[0]);

    try {
        const response = await fetch(`${API_URL}/gallery`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            uploadStatus.innerText = 'Images uploaded successfully!';
            uploadStatus.style.color = 'green';
            uploadForm.reset(); 
            loadAdminGallery(); // <-- Refresh the gallery below immediately
        } else {
            const data = await response.json();
            uploadStatus.innerText = `Error: ${data.message}`;
            uploadStatus.style.color = 'red';
        }
    } catch (error) {
        uploadStatus.innerText = 'Upload failed. Check console for details.';
        uploadStatus.style.color = 'red';
    } finally {
        uploadBtn.innerText = 'Upload to Gallery';
        uploadBtn.disabled = false;
    }
});

// --- LOGOUT LOGIC ---
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    token = null;
    loginForm.reset();
    showLogin();
});

// --- UI HELPER FUNCTIONS ---
function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    loadAdminGallery(); // Fetch existing images when opening dashboard
}

function showLogin() {
    dashboardScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
}

// --- MANAGE GALLERY LOGIC (FETCH & DELETE) ---
async function loadAdminGallery() {
    const grid = document.getElementById('adminGalleryGrid');
    if (!grid) return;
    grid.innerHTML = '<p style="color: var(--text-light);">Loading cases...</p>';

    try {
        const response = await fetch(`${API_URL}/gallery`);
        const images = await response.json();

        grid.innerHTML = '';

        if (images.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-light);">No cases uploaded yet.</p>';
            return;
        }

images.forEach(item => {
            const card = document.createElement('div');
            card.style.cssText = 'border: 1px solid #E2E8F0; border-radius: 8px; padding: 1rem; background: #F8FAFC; text-align: center;';
            
            // Now showing BOTH Before and After images side-by-side
            card.innerHTML = `
                <h4 style="margin-bottom: 0.5rem; color: var(--primary); font-size: 1.1rem; text-transform: capitalize;">${item.title}</h4>
                
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <span style="position: absolute; top: 4px; left: 4px; background: rgba(15, 23, 42, 0.7); color: white; font-size: 0.6rem; padding: 2px 4px; border-radius: 3px; font-weight: bold;">Before</span>
                        <img src="${item.beforeImageUrl}" alt="Before" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;">
                    </div>
                    <div style="flex: 1; position: relative;">
                        <span style="position: absolute; top: 4px; left: 4px; background: var(--primary); color: white; font-size: 0.6rem; padding: 2px 4px; border-radius: 3px; font-weight: bold;">After</span>
                        <img src="${item.afterImageUrl}" alt="After" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;">
                    </div>
                </div>

                <button onclick="deleteImage('${item._id}')" style="background: #EF4444; color: white; border: none; width: 100%; padding: 0.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                    <i class="fas fa-trash"></i> Delete Case
                </button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading gallery:', error);
        grid.innerHTML = '<p style="color: red;">Failed to load cases.</p>';
    }
}

// Attached to the window object so the onclick attribute can find it
window.deleteImage = async function(id) {
    // Safety prompt before deleting
    if (!confirm('Are you sure you want to delete this case? It will be removed from the website immediately.')) return;

    try {
        const response = await fetch(`${API_URL}/gallery/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadAdminGallery(); // Reload the grid to remove the deleted item visually
        } else {
            alert('Failed to delete image. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        alert('Server error while deleting.');
    }
};