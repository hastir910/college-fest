/**
 * Main JavaScript File
 * College Fest Management System
 * Utility Functions and Animations
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}-custom alert-dismissible fade show`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        <strong>${type === 'success' ? '✓' : '✗'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format time to 12-hour format
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

/**
 * Show loading spinner
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner-custom"></div><p class="text-center mt-3">Loading...</p>';
    }
}

/**
 * Hide loading spinner
 */
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Confirm action dialog
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// ANIMATION FUNCTIONS
// ============================================

/**
 * Add fade-in animation to elements
 */
function animateFadeIn(selector, delay = 0) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('fade-in');
        }, delay + (index * 100));
    });
}

/**
 * Add slide-up animation to elements
 */
function animateSlideUp(selector, delay = 0) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('slide-up');
        }, delay + (index * 100));
    });
}

/**
 * Add scale-in animation to elements
 */
function animateScaleIn(selector, delay = 0) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('scale-in');
        }, delay + (index * 100));
    });
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Add animations to cards on page load
    animateSlideUp('.custom-card', 100);
    animateSlideUp('.stat-card', 100);
    animateScaleIn('.event-card', 200);
    
    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn-primary-custom, .btn-outline-custom');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize tooltips if Bootstrap is loaded
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add active class to current nav item
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link-custom');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate login form
 */
function validateLoginForm(email, password) {
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return false;
    }
    
    return true;
}

/**
 * Validate registration form
 */
function validateRegistrationForm(name, email, password, confirmPassword, phone, college) {
    if (!name || !email || !password || !confirmPassword || !phone || !college) {
        showAlert('Please fill in all fields', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return false;
    }
    
    if (!isValidPhone(phone)) {
        showAlert('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    return true;
}

/**
 * Validate event form
 */
function validateEventForm(eventName, eventType, eventDate, eventTime, venue, maxParticipants, registrationFee) {
    if (!eventName || !eventType || !eventDate || !eventTime || !venue) {
        showAlert('Please fill in all required fields', 'error');
        return false;
    }
    
    if (maxParticipants < 1) {
        showAlert('Maximum participants must be at least 1', 'error');
        return false;
    }
    
    if (registrationFee < 0) {
        showAlert('Registration fee cannot be negative', 'error');
        return false;
    }
    
    // Check if event date is not in the past
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showAlert('Event date cannot be in the past', 'error');
        return false;
    }
    
    return true;
}

// ============================================
// DATA TABLE FUNCTIONS
// ============================================

/**
 * Create table row with actions
 */
function createTableRow(data, columns, actions) {
    let row = '<tr>';
    
    columns.forEach(column => {
        row += `<td>${data[column] || '-'}</td>`;
    });
    
    if (actions && actions.length > 0) {
        row += '<td>';
        actions.forEach(action => {
            row += action(data);
        });
        row += '</td>';
    }
    
    row += '</tr>';
    return row;
}

/**
 * Search/Filter table
 */
function filterTable(tableId, searchValue) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    const searchTerm = searchValue.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

/**
 * Save to local storage
 */
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Get from local storage
 */
function getFromLocalStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

/**
 * Remove from local storage
 */
function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

// ============================================
// NUMBER ANIMATION
// ============================================

/**
 * Animate number counting
 */
function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Initialize number animations for stat cards
 */
function initializeStatAnimations() {
    document.querySelectorAll('.stat-number').forEach(element => {
        const targetValue = parseInt(element.textContent);
        element.textContent = '0';
        setTimeout(() => {
            animateNumber(element, 0, targetValue, 2000);
        }, 500);
    });
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.festUtils = {
    showAlert,
    formatDate,
    formatTime,
    formatCurrency,
    isValidEmail,
    isValidPhone,
    showLoading,
    hideLoading,
    confirmAction,
    validateLoginForm,
    validateRegistrationForm,
    validateEventForm,
    filterTable,
    animateFadeIn,
    animateSlideUp,
    animateScaleIn,
    smoothScrollTo,
    initializeStatAnimations,
    animateNumber
};