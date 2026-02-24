<?php
/**
 * Admin Event Management Handler
 * College Fest Management System
 */

require_once 'config.php';

// Check if user is admin
if (!is_logged_in() || !is_admin()) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$response = array('success' => false, 'message' => '', 'data' => null);
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

switch ($action) {
    case 'get_events':
        // Fetch all events
        $query = "SELECT e.*, 
                  (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registered_count 
                  FROM events e ORDER BY e.event_date ASC";
        $result = mysqli_query($conn, $query);
        
        $events = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $events[] = $row;
        }
        
        $response['success'] = true;
        $response['data'] = $events;
        break;
        
    case 'add_event':
        // Add new event
        $event_name = sanitize_input($_POST['event_name']);
        $event_type = sanitize_input($_POST['event_type']);
        $description = sanitize_input($_POST['description']);
        $event_date = sanitize_input($_POST['event_date']);
        $event_time = sanitize_input($_POST['event_time']);
        $venue = sanitize_input($_POST['venue']);
        $max_participants = intval($_POST['max_participants']);
        $registration_fee = floatval($_POST['registration_fee']);
        $status = sanitize_input($_POST['status']);
        
        $query = "INSERT INTO events (event_name, event_type, description, event_date, event_time, venue, max_participants, registration_fee, status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "ssssssdss", $event_name, $event_type, $description, $event_date, $event_time, $venue, $max_participants, $registration_fee, $status);
        
        if (mysqli_stmt_execute($stmt)) {
            $response['success'] = true;
            $response['message'] = 'Event added successfully!';
        } else {
            $response['message'] = 'Failed to add event';
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'update_event':
        // Update existing event
        $event_id = intval($_POST['event_id']);
        $event_name = sanitize_input($_POST['event_name']);
        $event_type = sanitize_input($_POST['event_type']);
        $description = sanitize_input($_POST['description']);
        $event_date = sanitize_input($_POST['event_date']);
        $event_time = sanitize_input($_POST['event_time']);
        $venue = sanitize_input($_POST['venue']);
        $max_participants = intval($_POST['max_participants']);
        $registration_fee = floatval($_POST['registration_fee']);
        $status = sanitize_input($_POST['status']);
        
        $query = "UPDATE events SET event_name=?, event_type=?, description=?, event_date=?, event_time=?, 
                  venue=?, max_participants=?, registration_fee=?, status=? WHERE id=?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "ssssssdssi", $event_name, $event_type, $description, $event_date, $event_time, $venue, $max_participants, $registration_fee, $status, $event_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $response['success'] = true;
            $response['message'] = 'Event updated successfully!';
        } else {
            $response['message'] = 'Failed to update event';
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'delete_event':
        // Delete event
        $event_id = intval($_POST['event_id']);
        
        $query = "DELETE FROM events WHERE id = ?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "i", $event_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $response['success'] = true;
            $response['message'] = 'Event deleted successfully!';
        } else {
            $response['message'] = 'Failed to delete event';
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'get_stats':
        // Get dashboard statistics
        $stats = array();
        
        try {
            // Total events
            $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM events");
            if ($result) {
                $row = mysqli_fetch_assoc($result);
                $stats['total_events'] = (int)$row['count'];
            } else {
                $stats['total_events'] = 0;
                error_log("Events count query failed: " . mysqli_error($conn));
            }
            
            // Total users
            $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users WHERE role='user'");
            if ($result) {
                $row = mysqli_fetch_assoc($result);
                $stats['total_users'] = (int)$row['count'];
            } else {
                $stats['total_users'] = 0;
                error_log("Users count query failed: " . mysqli_error($conn));
            }
            
            // Total registrations
            $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM registrations");
            if ($result) {
                $row = mysqli_fetch_assoc($result);
                $stats['total_registrations'] = (int)$row['count'];
            } else {
                $stats['total_registrations'] = 0;
                error_log("Registrations count query failed: " . mysqli_error($conn));
            }
            
            // Total revenue
            $result = mysqli_query($conn, "SELECT SUM(e.registration_fee) as revenue FROM registrations r 
                                           JOIN events e ON r.event_id = e.id WHERE r.payment_status='completed'");
            if ($result) {
                $row = mysqli_fetch_assoc($result);
                $stats['total_revenue'] = $row['revenue'] ? (float)$row['revenue'] : 0;
            } else {
                $stats['total_revenue'] = 0;
                error_log("Revenue query failed: " . mysqli_error($conn));
            }
            
            $response['success'] = true;
            $response['data'] = $stats;
            $response['message'] = 'Stats loaded successfully';
            
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = 'Error loading stats: ' . $e->getMessage();
            error_log("Stats error: " . $e->getMessage());
        }
        break;
        
    default:
        $response['message'] = 'Invalid action';
}

echo json_encode($response);
mysqli_close($conn);
?>