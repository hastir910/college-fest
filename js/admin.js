/**
 * Admin JavaScript Functions
 * College Fest Management System
 */

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
        case 'dashboard':
            loadStats();
            break;
        case 'events':
            loadEvents();
            break;
        case 'users':
            loadUsers();
            break;
        case 'registrations':
            loadRegistrations();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
    }
}

// ============================================
// LOAD DASHBOARD STATS
// ============================================

async function loadStats() {
    try {
        console.log('Loading stats...');
        const response = await fetch('php/admin_events.php?action=get_stats');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Result:', result);
        
        if (result.success) {
            const stats = result.data;
            console.log('Stats data:', stats);
            
            // Set values directly without animation for now
            document.getElementById('totalEvents').textContent = stats.total_events || 0;
            document.getElementById('totalUsers').textContent = stats.total_users || 0;
            document.getElementById('totalRegistrations').textContent = stats.total_registrations || 0;
            document.getElementById('totalRevenue').textContent = Math.floor(stats.total_revenue || 0);
            
            console.log('Stats updated successfully!');
        } else {
            console.error('Stats loading failed:', result.message);
            festUtils.showAlert('Failed to load statistics: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        festUtils.showAlert('Error loading statistics. Check console for details.', 'error');
        
        // Set default values
        document.getElementById('totalEvents').textContent = '0';
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalRegistrations').textContent = '0';
        document.getElementById('totalRevenue').textContent = '0';
    }
}

// ============================================
// EVENT MANAGEMENT
// ============================================

async function loadEvents() {
    try {
        festUtils.showLoading('eventsTableBody');
        
        const response = await fetch('php/admin_events.php?action=get_events');
        const result = await response.json();
        
        if (result.success) {
            const events = result.data;
            const tbody = document.getElementById('eventsTableBody');
            tbody.innerHTML = '';
            
            events.forEach(event => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${event.event_name}</td>
                    <td>${event.event_type}</td>
                    <td>${festUtils.formatDate(event.event_date)}</td>
                    <td>${event.venue}</td>
                    <td>${event.registered_count}/${event.max_participants}</td>
                    <td>${festUtils.formatCurrency(event.registration_fee)}</td>
                    <td><span class="badge-custom badge-${event.status}">${event.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-custom me-1" onclick="editEvent(${event.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger-custom" onclick="deleteEvent(${event.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            festUtils.animateSlideUp('#eventsTableBody tr', 50);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        festUtils.showAlert('Failed to load events', 'error');
    }
}

function showAddEventModal() {
    document.getElementById('eventModalTitle').innerHTML = '<i class="fas fa-calendar-plus me-2"></i>Add New Event';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

async function editEvent(eventId) {
    try {
        const response = await fetch('php/admin_events.php?action=get_events');
        const result = await response.json();
        
        if (result.success) {
            const event = result.data.find(e => e.id == eventId);
            if (event) {
                document.getElementById('eventModalTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Edit Event';
                document.getElementById('eventId').value = event.id;
                document.getElementById('eventName').value = event.event_name;
                document.getElementById('eventType').value = event.event_type;
                document.getElementById('eventDescription').value = event.description;
                document.getElementById('eventDate').value = event.event_date;
                document.getElementById('eventTime').value = event.event_time;
                document.getElementById('eventVenue').value = event.venue;
                document.getElementById('eventMaxParticipants').value = event.max_participants;
                document.getElementById('eventFee').value = event.registration_fee;
                document.getElementById('eventStatus').value = event.status;
                
                const modal = new bootstrap.Modal(document.getElementById('eventModal'));
                modal.show();
            }
        }
    } catch (error) {
        console.error('Error loading event:', error);
        festUtils.showAlert('Failed to load event details', 'error');
    }
}

async function deleteEvent(eventId) {
    if (!festUtils.confirmAction('Are you sure you want to delete this event? All registrations will also be deleted.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_event');
        formData.append('event_id', eventId);
        
        const response = await fetch('php/admin_events.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            loadEvents();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        festUtils.showAlert('Failed to delete event', 'error');
    }
}

// Event Form Submit
document.getElementById('eventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('eventId').value;
    const action = eventId ? 'update_event' : 'add_event';
    
    const formData = new FormData();
    formData.append('action', action);
    if (eventId) formData.append('event_id', eventId);
    formData.append('event_name', document.getElementById('eventName').value);
    formData.append('event_type', document.getElementById('eventType').value);
    formData.append('description', document.getElementById('eventDescription').value);
    formData.append('event_date', document.getElementById('eventDate').value);
    formData.append('event_time', document.getElementById('eventTime').value);
    formData.append('venue', document.getElementById('eventVenue').value);
    formData.append('max_participants', document.getElementById('eventMaxParticipants').value);
    formData.append('registration_fee', document.getElementById('eventFee').value);
    formData.append('status', document.getElementById('eventStatus').value);
    
    try {
        const response = await fetch('php/admin_events.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
            loadEvents();
            loadStats();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        festUtils.showAlert('Failed to save event', 'error');
    }
});

// ============================================
// USER MANAGEMENT
// ============================================

async function loadUsers() {
    try {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';
        
        console.log('Fetching users...');
        const response = await fetch('php/admin_users.php?action=get_users');
        console.log('Users response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Users result:', result);
        
        if (result.success) {
            const users = result.data;
            tbody.innerHTML = '';
            
            document.getElementById('usersCount').textContent = users.length;
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray">No users found</td></tr>';
                return;
            }
            
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.college || 'N/A'}</td>
                    <td><span class="badge-custom ${user.role === 'admin' ? 'badge-ongoing' : 'badge-upcoming'}">${user.role}</span></td>
                    <td>${user.event_count || 0}</td>
                    <td>${festUtils.formatDate(user.created_at)}</td>
                    <td>
                        ${user.role !== 'admin' ? 
                        `<button class="btn btn-sm btn-danger-custom" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>` : 
                        '<span class="text-gray">Protected</span>'}
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            festUtils.animateSlideUp('#usersTableBody tr', 50);
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading users: ${error.message}</td></tr>`;
        festUtils.showAlert('Failed to load users: ' + error.message, 'error');
    }
}

async function deleteUser(userId) {
    if (!festUtils.confirmAction('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_user');
        formData.append('user_id', userId);
        
        const response = await fetch('php/admin_users.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            loadUsers();
            loadStats();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        festUtils.showAlert('Failed to delete user', 'error');
    }
}

// ============================================
// REGISTRATIONS MANAGEMENT
// ============================================

async function loadRegistrations() {
    try {
        festUtils.showLoading('registrationsTableBody');
        
        const response = await fetch('php/admin_users.php?action=get_registrations');
        const result = await response.json();
        
        if (result.success) {
            const registrations = result.data;
            const tbody = document.getElementById('registrationsTableBody');
            tbody.innerHTML = '';
            
            document.getElementById('registrationsCount').textContent = registrations.length;
            
            registrations.forEach(reg => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reg.user_name}</td>
                    <td>${reg.email}</td>
                    <td>${reg.event_name}</td>
                    <td>${reg.team_name || 'Individual'}</td>
                    <td>${reg.college}</td>
                    <td>${festUtils.formatDate(reg.registration_date)}</td>
                    <td>${festUtils.formatCurrency(reg.registration_fee)}</td>
                    <td><span class="badge-custom badge-${reg.payment_status === 'completed' ? 'ongoing' : 'pending'}">${reg.payment_status}</span></td>
                `;
                tbody.appendChild(row);
            });
            
            festUtils.animateSlideUp('#registrationsTableBody tr', 50);
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
        festUtils.showAlert('Failed to load registrations', 'error');
    }
}

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

async function loadAnnouncements() {
    try {
        const response = await fetch('php/announcements.php?action=get_announcements');
        const result = await response.json();
        
        if (result.success) {
            const announcements = result.data;
            const container = document.getElementById('announcementsContainer');
            container.innerHTML = '';
            
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
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-gray">
                                <i class="fas fa-user me-1"></i>${announcement.created_by_name} • 
                                ${festUtils.formatDate(announcement.created_at)}
                            </small>
                            <button class="btn btn-sm btn-danger-custom" onclick="deleteAnnouncement(${announcement.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
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

function showAddAnnouncementModal() {
    document.getElementById('announcementForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
    modal.show();
}

async function deleteAnnouncement(announcementId) {
    if (!festUtils.confirmAction('Are you sure you want to delete this announcement?')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_announcement');
        formData.append('announcement_id', announcementId);
        
        const response = await fetch('php/announcements.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            loadAnnouncements();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
        festUtils.showAlert('Failed to delete announcement', 'error');
    }
}

// Announcement Form Submit
document.getElementById('announcementForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'add_announcement');
    formData.append('title', document.getElementById('announcementTitle').value);
    formData.append('content', document.getElementById('announcementContent').value);
    formData.append('priority', document.getElementById('announcementPriority').value);
    
    try {
        const response = await fetch('php/announcements.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            festUtils.showAlert(result.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('announcementModal')).hide();
            loadAnnouncements();
        } else {
            festUtils.showAlert(result.message, 'error');
        }
    } catch (error) {
        console.error('Error adding announcement:', error);
        festUtils.showAlert('Failed to add announcement', 'error');
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadEvents();
});