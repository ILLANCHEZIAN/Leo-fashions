// Leo Fashions - Main JavaScript with Image Upload
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Application State
let currentAdmin = null;
let dresses = [
    {
        id: 1,
        name: "Floral Summer Dress",
        category: "casual",
        price: 2499,
        size: "M",
        description: "Beautiful floral print summer dress with comfortable fit.",
        image: "https://images.unsplash.com/photo-1564584217131-182cce3f7a66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        name: "Evening Gown",
        category: "party",
        price: 5999,
        size: "L",
        description: "Elegant evening gown for special occasions and parties.",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        name: "Bridal Lehenga",
        category: "wedding",
        price: 15999,
        size: "M",
        description: "Traditional bridal lehenga with intricate embroidery work.",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        name: "Casual Maxi Dress",
        category: "casual",
        price: 1999,
        size: "S",
        description: "Comfortable casual maxi dress perfect for everyday wear.",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        name: "Cocktail Dress",
        category: "party",
        price: 3499,
        size: "M",
        description: "Stylish cocktail dress for parties and social gatherings.",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6,
        name: "Traditional Saree",
        category: "traditional",
        price: 4999,
        size: "M",
        description: "Elegant traditional silk saree with beautiful border design.",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

let nextDressId = 7;
let currentImageFile = null;
let editingDressId = null;

// WhatsApp Configuration
const WHATSAPP_NUMBER = "919025291312"; // Updated to 90252 91312

// Initialize the application
function initApp() {
    // Load dresses from localStorage if available
    const savedDresses = localStorage.getItem('leoFashionsDresses');
    const savedAdmin = localStorage.getItem('leoFashionsAdmin');
    
    if (savedDresses) {
        dresses = JSON.parse(savedDresses);
        nextDressId = dresses.length > 0 ? Math.max(...dresses.map(d => d.id)) + 1 : 7;
    }
    
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial content
    loadHomePage();
    
    // Check if admin is logged in
    if (currentAdmin) {
        showAdminPanel();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-links a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            if (section === 'home') {
                loadHomePage();
            } else if (section === 'dresses') {
                loadDressesPage();
            } else if (section === 'offers') {
                loadOffersPage();
            } else if (section === 'contact') {
                loadContactPage();
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');
        });
    });
    
    // Admin button
    document.getElementById('adminBtn').addEventListener('click', function() {
        if (currentAdmin) {
            showAdminPanel();
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        } else {
            showAdminLoginModal();
        }
    });
    
    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (in real app, this would be server-side)
        if (username === 'admin' && password === 'admin123') {
            currentAdmin = { username, loginTime: new Date().toISOString() };
            localStorage.setItem('leoFashionsAdmin', JSON.stringify(currentAdmin));
            
            // Close modal
            document.getElementById('adminModal').style.display = 'none';
            
            // Show admin panel
            showAdminPanel();
            
            // Update admin button
            document.getElementById('adminBtn').innerHTML = '<i class="fas fa-user-cog"></i> Admin Panel';
            
            // Clear form
            this.reset();
            
            // Show success message
            showMessage('Login successful! Welcome to Admin Panel.', 'success');
        } else {
            showMessage('Invalid username or password. Try admin/admin123', 'error');
        }
    });
    
    // Close modal button
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('adminModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('adminModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        currentAdmin = null;
        localStorage.removeItem('leoFashionsAdmin');
        
        // Return to home page
        loadHomePage();
        
        // Update admin button
        document.getElementById('adminBtn').innerHTML = '<i class="fas fa-user-cog"></i> Admin';
        
        // Show message
        showMessage('Logged out successfully.', 'success');
    });
    
    // Add dress button
    document.getElementById('addDressBtn')?.addEventListener('click', function() {
        showDressForm();
    });
    
    // Cancel dress form
    document.getElementById('cancelFormBtn')?.addEventListener('click', function() {
        hideDressForm();
        resetImageUpload();
    });
    
    // Save dress form
    document.getElementById('dressForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveDress();
    });
    
    // Image upload
    document.getElementById('dressImageUpload')?.addEventListener('change', function(e) {
        handleImageUpload(e);
    });
    
    // Remove image button
    document.getElementById('removeImageBtn')?.addEventListener('click', function() {
        resetImageUpload();
    });
    
    // WhatsApp button
    document.getElementById('whatsappBtn')?.addEventListener('click', function() {
        contactAdminOnWhatsApp();
    });
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    });
    
    // Contact form
    document.getElementById('contactForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        showMessage('Thank you for your message! We will get back to you soon.', 'success');
        this.reset();
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter dresses
            filterDresses(category);
        });
    });
}

// Show admin login modal
function showAdminLoginModal() {
    document.getElementById('adminModal').style.display = 'flex';
}

// Load home page
function loadHomePage() {
    showSection('home');
}

// Load dresses page
function loadDressesPage() {
    showSection('dresses');
    renderDresses('all');
}

// Load offers page
function loadOffersPage() {
    showSection('offers');
}

// Load contact page
function loadContactPage() {
    showSection('contact');
}

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        section.classList.add('active');
    }
}

// Show admin panel
function showAdminPanel() {
    showSection('adminPanel');
    renderAdminDressTable();
}

// Render dresses in the user view
function renderDresses(category) {
    const dressGrid = document.getElementById('dressGrid');
    
    // Filter dresses by category
    let filteredDresses = dresses;
    if (category !== 'all') {
        filteredDresses = dresses.filter(dress => dress.category === category);
    }
    
    // Clear the grid
    dressGrid.innerHTML = '';
    
    // Render each dress
    filteredDresses.forEach(dress => {
        const dressCard = document.createElement('div');
        dressCard.className = 'dress-card';
        dressCard.setAttribute('data-id', dress.id);
        
        const categoryLabels = {
            casual: 'Casual Wear',
            party: 'Party Wear',
            wedding: 'Wedding Wear',
            traditional: 'Traditional Wear'
        };
        
        dressCard.innerHTML = `
            <div class="dress-image">
                <img src="${dress.image}" alt="${dress.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\" viewBox=\"0 0 400 300\"><rect width=\"400\" height=\"300\" fill=\"%23f8f9fa\"/><text x=\"200\" y=\"150\" font-family=\"Arial\" font-size=\"20\" text-anchor=\"middle\" fill=\"%236c757d\">Image not available</text></svg>'">
            </div>
            <div class="dress-info">
                <h3>${dress.name}</h3>
                <span class="dress-category">${categoryLabels[dress.category] || dress.category}</span>
                <div class="dress-price">₹${dress.price.toLocaleString()}</div>
                <div class="dress-size">Size: ${dress.size}</div>
                <p class="dress-description">${dress.description}</p>
                <button class="btn whatsapp-btn dress-whatsapp-btn" data-id="${dress.id}" style="width: 100%;">
                    <i class="fab fa-whatsapp"></i> Inquire on WhatsApp
                </button>
            </div>
        `;
        
        dressGrid.appendChild(dressCard);
    });
    
    // Add event listeners to WhatsApp buttons on dress cards
    document.querySelectorAll('.dress-whatsapp-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dressId = parseInt(this.getAttribute('data-id'));
            contactAdminOnWhatsApp(dressId);
        });
    });
}

// Filter dresses based on category
function filterDresses(category) {
    renderDresses(category);
}

// Render admin dress table
function renderAdminDressTable() {
    const tableBody = document.getElementById('adminDressTable');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Render each dress
    dresses.forEach(dress => {
        const row = document.createElement('tr');
        
        const categoryLabels = {
            casual: 'Casual',
            party: 'Party',
            wedding: 'Wedding',
            traditional: 'Traditional'
        };
        
        row.innerHTML = `
            <td>${dress.id}</td>
            <td>
                <img src="${dress.image}" alt="${dress.name}" 
                     onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><rect width=\"60\" height=\"60\" fill=\"%23f8f9fa\"/><text x=\"30\" y=\"30\" font-family=\"Arial\" font-size=\"12\" text-anchor=\"middle\" fill=\"%236c757d\">No Image</text></svg>'">
            </td>
            <td>${dress.name}</td>
            <td>${categoryLabels[dress.category] || dress.category}</td>
            <td>₹${dress.price.toLocaleString()}</td>
            <td>${dress.size}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" data-id="${dress.id}">Edit</button>
                    <button class="btn-delete" data-id="${dress.id}">Delete</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const dressId = parseInt(this.getAttribute('data-id'));
            editDress(dressId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const dressId = parseInt(this.getAttribute('data-id'));
            deleteDress(dressId);
        });
    });
}

// Show dress form for adding or editing
function showDressForm(dress = null) {
    const formContainer = document.getElementById('dressFormContainer');
    const formTitle = document.getElementById('formTitle');
    const form = document.getElementById('dressForm');
    
    if (dress) {
        // Edit mode
        formTitle.textContent = 'Edit Dress';
        editingDressId = dress.id;
        document.getElementById('dressId').value = dress.id;
        document.getElementById('dressName').value = dress.name;
        document.getElementById('dressCategory').value = dress.category;
        document.getElementById('dressPrice').value = dress.price;
        document.getElementById('dressSize').value = dress.size;
        document.getElementById('dressDescription').value = dress.description;
        
        // Show existing image
        const preview = document.getElementById('imagePreview');
        const noPreview = document.getElementById('noImagePreview');
        const removeBtn = document.getElementById('removeImageBtn');
        
        if (dress.image && dress.image.startsWith('data:image')) {
            // Image is already a data URL
            preview.src = dress.image;
            preview.style.display = 'block';
            noPreview.style.display = 'none';
            removeBtn.style.display = 'block';
        } else if (dress.image) {
            // Image is a URL, use it directly
            preview.src = dress.image;
            preview.style.display = 'block';
            noPreview.style.display = 'none';
            removeBtn.style.display = 'block';
        } else {
            // No image
            resetImageUpload();
        }
    } else {
        // Add mode
        formTitle.textContent = 'Add New Dress';
        editingDressId = null;
        form.reset();
        document.getElementById('dressId').value = '';
        resetImageUpload();
    }
    
    formContainer.style.display = 'block';
    
    // Scroll to form
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Hide dress form
function hideDressForm() {
    document.getElementById('dressFormContainer').style.display = 'none';
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        resetImageUpload();
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showMessage('Please select a valid image file (JPG, PNG, GIF, etc.)', 'error');
        resetImageUpload();
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size should be less than 5MB', 'error');
        resetImageUpload();
        return;
    }
    
    currentImageFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const noPreview = document.getElementById('noImagePreview');
        const removeBtn = document.getElementById('removeImageBtn');
        
        preview.src = e.target.result;
        preview.style.display = 'block';
        noPreview.style.display = 'none';
        removeBtn.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

// Reset image upload
function resetImageUpload() {
    const fileInput = document.getElementById('dressImageUpload');
    const preview = document.getElementById('imagePreview');
    const noPreview = document.getElementById('noImagePreview');
    const removeBtn = document.getElementById('removeImageBtn');
    
    fileInput.value = '';
    preview.src = '';
    preview.style.display = 'none';
    noPreview.style.display = 'block';
    removeBtn.style.display = 'none';
    currentImageFile = null;
}

// Convert image file to data URL
function imageFileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(new Error('Failed to read image file'));
        };
        reader.readAsDataURL(file);
    });
}

// Save dress (add or update)
async function saveDress() {
    const id = document.getElementById('dressId').value;
    const name = document.getElementById('dressName').value;
    const category = document.getElementById('dressCategory').value;
    const price = parseFloat(document.getElementById('dressPrice').value);
    const size = document.getElementById('dressSize').value;
    const description = document.getElementById('dressDescription').value;
    
    // Validate inputs
    if (!name || !category || !price || !size || !description) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (price <= 0) {
        showMessage('Price must be greater than 0', 'error');
        return;
    }
    
    let imageData = '';
    
    // Handle image
    if (currentImageFile) {
        try {
            // Convert image to data URL
            imageData = await imageFileToDataURL(currentImageFile);
        } catch (error) {
            showMessage('Error processing image: ' + error.message, 'error');
            return;
        }
    } else if (id) {
        // If editing and no new image, keep existing image
        const existingDress = dresses.find(d => d.id === parseInt(id));
        if (existingDress) {
            imageData = existingDress.image;
        }
    } else {
        // If adding new dress without image, use default
        imageData = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f8f9fa"/><text x="200" y="150" font-family="Arial" font-size="20" text-anchor="middle" fill="%236c757d">No Image Available</text></svg>';
    }
    
    if (id) {
        // Update existing dress
        const index = dresses.findIndex(d => d.id === parseInt(id));
        if (index !== -1) {
            dresses[index] = {
                id: parseInt(id),
                name,
                category,
                price,
                size,
                description,
                image: imageData
            };
            
            showMessage('Dress updated successfully!', 'success');
        }
    } else {
        // Add new dress
        const newDress = {
            id: nextDressId++,
            name,
            category,
            price,
            size,
            description,
            image: imageData
        };
        
        dresses.push(newDress);
        showMessage('Dress added successfully!', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('leoFashionsDresses', JSON.stringify(dresses));
    
    // Update UI
    renderAdminDressTable();
    
    // Update user view if on dresses page
    if (document.getElementById('dresses').classList.contains('active')) {
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-category');
        renderDresses(activeFilter);
    }
    
    // Hide form and reset
    hideDressForm();
    resetImageUpload();
}

// Edit a dress
function editDress(id) {
    const dress = dresses.find(d => d.id === id);
    if (dress) {
        showDressForm(dress);
    }
}

// Delete a dress
function deleteDress(id) {
    if (confirm('Are you sure you want to delete this dress?')) {
        const index = dresses.findIndex(d => d.id === id);
        if (index !== -1) {
            dresses.splice(index, 1);
            
            // Save to localStorage
            localStorage.setItem('leoFashionsDresses', JSON.stringify(dresses));
            
            // Update UI
            renderAdminDressTable();
            
            // Update user view if on dresses page
            if (document.getElementById('dresses').classList.contains('active')) {
                const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-category');
                renderDresses(activeFilter);
            }
            
            showMessage('Dress deleted successfully!', 'success');
        }
    }
}

// Contact admin on WhatsApp
function contactAdminOnWhatsApp(dressId = null) {
    let message = "Hello, I'm interested in ";
    
    if (dressId) {
        const dress = dresses.find(d => d.id === dressId);
        if (dress) {
            message += `the "${dress.name}" (ID: ${dress.id}) from Leo Fashions.`;
            message += ` Price: ₹${dress.price}, Size: ${dress.size}.`;
            message += ` Can you please provide more details about availability and delivery?`;
        } else {
            message += "a dress from Leo Fashions.";
        }
    } else {
        message += "your dresses from Leo Fashions. Can you please provide more information?";
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp URL with the updated admin number
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Show message to user
function showMessage(text, type = 'info') {
    // Remove any existing message
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const message = document.createElement('div');
    message.className = `message-toast message-${type}`;
    message.textContent = text;
    
    // Style the message
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        message.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        message.style.backgroundColor = '#dc3545';
    } else {
        message.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(message);
    
    // Remove after 5 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 300);
    }, 5000);
}

// Add CSS for message animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);