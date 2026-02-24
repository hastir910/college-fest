/**
 * User JavaScript Functions
 * College Fest Management System
 */

let allEvents = [];
let selectedEvent = null;

// ============================================
// SECTION MANAGEMENT
// ============================================

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.nav-link-custom').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section data
    switch(sectionName) {
        case 'events':
            loadEvents();
            break;
        case 'myRegistrations':
            loadMyRegistrations();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// ============================================
// LOAD EVENTS
// ============================================

async function loadEvents() {
    try {
        const response = await fetch('php/user_events.php?action=get_events');
        const result = await response.json();
        
        if (result.success) {
            allEvents = result.data;
            displayEvents(allEvents);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        festUtils.showAlert('Failed to load events', 'error');
    }
}

function displayEvents(events) {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="custom-card text-center">
                    <i class="fas fa-calendar-times" style="font-size: 4rem; opacity: 0.3;"></i>
                    <h4 class="text-gray mt-3">No events found</h4>
                </div>
            </div>
        `;
        return;
    }
    
    events.forEach(event => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const isRegistered = event.is_registered > 0;
        const isFull = event.registered_count >= event.max_participants;
        const availableSpots = event.max_participants - event.registered_count;
        
        col.innerHTML = `
            <div class="event-card" onclick="showEventDetails(${event.id})">
                <div class="event-header">
                    <span class="event-type-badge">${event.event_type}</span>
                    <h3 class="event-title">${event.event_name}</h3>
                </div>
                <div class="event-body">
                    <div class="event-info">
                        <i class="fas fa-calendar"></i>
                        <span>${festUtils.formatDate(event.event_date)}</span>
                    </div>
                    <div class="event-info">
                        <i class="fas fa-clock"></i>
                        <span>${festUtils.formatTime(event.event_time)}</span>
                    </div>
                    <div class="event-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.venue}</span>
                    </div>
                    <div class="event-info">
                        <i class="fas fa-users"></i>
                        <span>${event.registered_count}/${event.max_participants} registered</span>
                    </div>
                    <div class="event-info">
                        <i class="fas fa-rupee-sign"></i>
                        <span>${festUtils.formatCurrency(event.registration_fee)}</span>
                    </div>
                    
                    <div class="mt-3">
                        ${isRegistered ? 
                            '<span class="badge-custom badge-ongoing w-100"><i class="fas fa-check me-2"></i>Registered</span>' :
                            isFull ?
                            '<span class="badge-custom badge-completed w-100"><i class="fas fa-times me-2"></i>Full</span>' :
                            `<span class="badge-custom badge-upcoming w-100"><i class="fas fa-user-plus me-2"></i>${availableSpots} spots left</span>`
                        }
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
    
    festUtils.animateScaleIn('.event-card', 100);
}

// ============================================
// FILTER EVENTS
// ============================================

function filterEvents() {
    const searchTerm = document.getElementById('searchEvents').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    
    const filteredEvents = allEvents.filter(event => {
        const matchesSearch = event.event_name.toLowerCase().includes(searchTerm) || 
                            event.description.toLowerCase().includes(searchTerm);
        const matchesType = !filterType || event.event_type === filterType;
        
        return matchesSearch && matchesType;
    });
    
    displayEvents(filteredEvents);
}

// ============================================
// EVENT DETAILS
// ============================================

function showEventDetails(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    selectedEvent = event;
    const isRegistered = event.is_registered > 0;
    const isFull = event.registered_count >= event.max_participants;
    
    document.getElementById('modalEventTitle').innerHTML = `
        <i class="fas fa-calendar-star me-2"></i>${event.event_name}
    `;
    
    document.getElementById('modalEventBody').innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label-custom">Event Type</label>
                <div class="text-white">${event.event_type}</div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label-custom">Registration Fee</label>
                <div class="text-white">${festUtils.formatCurrency(event.registration_fee)}</div>
            </div>
        </div>
        
        <div class="mb-3">
            <label class="form-label-custom">Description</label>
            <div class="text-white">${event.description}</div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label-custom">Date & Time</label>
                <div class="text-white">
                    <i class="fas fa-calendar me-2"></i>${festUtils.formatDate(event.event_date)}<br>
                    <i class="fas fa-clock me-2"></i>${festUtils.formatTime(event.event_time)}
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label-custom">Venue</label>
                <div class="text-white">
                    <i class="fas fa-map-marker-alt me-2"></i>${event.venue}
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <label class="form-label-custom">Availability</label>
            <div class="text-white">
                ${event.registered_count} / ${event.max_participants} registered
                ${!isFull ? ` (${event.max_participants - event.registered_count} spots remaining)` : ' (FULL)'}
            </div>
        </div>
        
        ${isRegistered ? `
            <div class="alert alert-success-custom">
                <i class="fas fa-check-circle me-2"></i>You are already registered for this event!
            </div>
        ` : ''}
    `;
    
    const registerBtn = document.getElementById('registerBtn');
    if (isRegistered || isFull) {
        registerBtn.style.display = 'none';
    } else {
        registerBtn.style.display = 'block';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
    modal.show();
}

// ============================================
// REGISTER FOR EVENT
// ============================================

async function registerForEvent() {
    if (!selectedEvent) return;
    
    if (!festUtils.confirmAction(`Register for ${selectedEvent.event_name}?`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'register_event');
        formData.append('event_id', selectedEvent.id);
        
        const response = await fetch('php/user_events.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal')).hide();
            loadEvents();
            loadMyRegistrations();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error registering:', error);
        festUtils.showAlert('Failed to register for event', 'error');
    }
}

// ============================================
// MY REGISTRATIONS
// ============================================

async function loadMyRegistrations() {
    try {
        const response = await fetch('php/user_events.php?action=get_my_registrations');
        const result = await response.json();
        
        if (result.success) {
            const registrations = result.data;
            const container = document.getElementById('myRegistrationsContainer');
            container.innerHTML = '';
            
            if (registrations.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="custom-card text-center">
                            <i class="fas fa-inbox" style="font-size: 4rem; opacity: 0.3;"></i>
                            <h4 class="text-gray mt-3">No registrations yet</h4>
                            <p class="text-gray">Start by registering for events!</p>
                            <button class="btn btn-primary-custom mt-3" onclick="showSection('events')">
                                <i class="fas fa-calendar me-2"></i>Browse Events
                            </button>
                        </div>
                    </div>
                `;
                return;
            }
            
            registrations.forEach(reg => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 mb-4';
                col.innerHTML = `
                    <div class="custom-card">
                        <h5 class="text-white mb-2">${reg.event_name}</h5>
                        <span class="badge-custom badge-upcoming mb-3">${reg.event_type}</span>
                        
                        <div class="event-info mb-2">
                            <i class="fas fa-calendar"></i>
                            <span>${festUtils.formatDate(reg.event_date)}</span>
                        </div>
                        <div class="event-info mb-2">
                            <i class="fas fa-clock"></i>
                            <span>${festUtils.formatTime(reg.event_time)}</span>
                        </div>
                        <div class="event-info mb-2">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${reg.venue}</span>
                        </div>
                        <div class="event-info mb-2">
                            <i class="fas fa-rupee-sign"></i>
                            <span>${festUtils.formatCurrency(reg.registration_fee)}</span>
                        </div>
                        
                        <div class="mt-3 pt-3" style="border-top: 1px solid rgba(255, 46, 46, 0.2);">
                            <small class="text-gray">
                                <i class="fas fa-check-circle me-1"></i>Registered on ${festUtils.formatDate(reg.registration_date)}
                            </small>
                        </div>
                        
                        <button class="btn btn-danger-custom w-100 mt-3" onclick="cancelRegistration(${reg.event_id}, '${reg.event_name}')">
                            <i class="fas fa-times me-2"></i>Cancel Registration
                        </button>
                    </div>
                `;
                container.appendChild(col);
            });
            
            festUtils.animateSlideUp('.custom-card', 100);
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
        festUtils.showAlert('Failed to load registrations', 'error');
    }
}

async function cancelRegistration(eventId, eventName) {
    if (!festUtils.confirmAction(`Cancel registration for ${eventName}?`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'cancel_registration');
        formData.append('event_id', eventId);
        
        const response = await fetch('php/user_events.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            loadMyRegistrations();
            loadEvents();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error cancelling registration:', error);
        festUtils.showAlert('Failed to cancel registration', 'error');
    }
}

// ============================================
// ANNOUNCEMENTS
// ============================================

async function loadAnnouncements() {
    try {
        const response = await fetch('php/announcements.php?action=get_announcements');
        const result = await response.json();
        
        if (result.success) {
            const announcements = result.data;
            const container = document.getElementById('announcementsContainer');
            container.innerHTML = '';
            
            if (announcements.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="custom-card text-center">
                            <i class="fas fa-bullhorn" style="font-size: 4rem; opacity: 0.3;"></i>
                            <h4 class="text-gray mt-3">No announcements yet</h4>
                        </div>
                    </div>
                `;
                return;
            }
            
            announcements.forEach(announcement => {
                const col = document.createElement('div');
                col.className = 'col-md-6 mb-3';
                col.innerHTML = `
                    <div class="custom-card">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="text-white mb-0">${announcement.title}</h5>
                            <span class="badge-custom badge-${announcement.priority === 'high' ? 'ongoing' : announcement.priority === 'medium' ? 'upcoming' : 'completed'}">
                                ${announcement.priority}
                            </span>
                        </div>
                        <p class="text-gray mb-2">${announcement.content}</p>
                        <small class="text-gray">
                            <i class="fas fa-clock me-1"></i>${festUtils.formatDate(announcement.created_at)}
                        </small>
                    </div>
                `;
                container.appendChild(col);
            });
            
            festUtils.animateScaleIn('.custom-card', 100);
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        festUtils.showAlert('Failed to load announcements', 'error');
    }
}

// ============================================
// PROFILE
// ============================================

async function loadProfile() {
    try {
        // Fetch actual user profile from server
        const response = await fetch('php/get_profile.php');
        const result = await response.json();
        
        if (result.success) {
            const profile = result.data;
            
            // Set profile values from database
            document.getElementById('profileName').value = profile.name || '';
            document.getElementById('profileEmail').value = profile.email || '';
            document.getElementById('profileCollege').value = profile.college || '';
            
            console.log('Profile loaded:', profile);
        } else {
            console.error('Failed to load profile:', result.message);
            festUtils.showAlert('Failed to load profile: ' + result.message, 'error');
        }
        
        // Load user statistics
        const statsResponse = await fetch('php/user_events.php?action=get_my_registrations');
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            const registrations = statsResult.data;
            const eventsCount = registrations.length;
            
            // Calculate total spent
            let totalSpent = 0;
            registrations.forEach(reg => {
                totalSpent += parseFloat(reg.registration_fee || 0);
            });
            
            // Count upcoming events
            const today = new Date();
            const upcomingCount = registrations.filter(reg => {
                const eventDate = new Date(reg.event_date);
                return eventDate >= today;
            }).length;
            
            // Animate stats
            festUtils.animateNumber(document.getElementById('userEventsCount'), 0, eventsCount, 1500);
            festUtils.animateNumber(document.getElementById('userTotalSpent'), 0, Math.floor(totalSpent), 1500);
            festUtils.animateNumber(document.getElementById('upcomingEvents'), 0, upcomingCount, 1500);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        festUtils.showAlert('Error loading profile. Please try refreshing.', 'error');
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
});