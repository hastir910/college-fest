<?php
/**
 * User Events Handler
 * College Fest Management System
 */

require_once 'config.php';

// Check if user is logged in
if (!is_logged_in()) {
    echo json_encode(['success' => false, 'message' => 'Please login first']);
    exit();
}

$response = array('success' => false, 'message' => '', 'data' => null);
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

switch ($action) {
    case 'get_events':
        // Fetch all upcoming events with registration status
        $user_id = $_SESSION['user_id'];
        $query = "SELECT e.*, 
                  (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registered_count,
                  (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND user_id = ?) as is_registered
                  FROM events e 
                  WHERE e.status = 'upcoming' 
                  ORDER BY e.event_date ASC";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $events = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $events[] = $row;
        }
        
        $response['success'] = true;
        $response['data'] = $events;
        mysqli_stmt_close($stmt);
        break;
        
    case 'register_event':
        // Register user for an event
        $user_id = $_SESSION['user_id'];
        $event_id = intval($_POST['event_id']);
        $team_name = isset($_POST['team_name']) ? sanitize_input($_POST['team_name']) : '';
        $team_members = isset($_POST['team_members']) ? sanitize_input($_POST['team_members']) : '';
        
        // Check if event exists and has space
        $check_query = "SELECT max_participants, 
                       (SELECT COUNT(*) FROM registrations WHERE event_id = ?) as current_registrations 
                       FROM events WHERE id = ?";
        $check_stmt = mysqli_prepare($conn, $check_query);
        mysqli_stmt_bind_param($check_stmt, "ii", $event_id, $event_id);
        mysqli_stmt_execute($check_stmt);
        $check_result = mysqli_stmt_get_result($check_stmt);
        
        if (mysqli_num_rows($check_result) === 0) {
            $response['message'] = 'Event not found';
            mysqli_stmt_close($check_stmt);
            echo json_encode($response);
            exit();
        }
        
        $event_data = mysqli_fetch_assoc($check_result);
        if ($event_data['current_registrations'] >= $event_data['max_participants']) {
            $response['message'] = 'Event is full. Registration closed.';
            mysqli_stmt_close($check_stmt);
            echo json_encode($response);
            exit();
        }
        mysqli_stmt_close($check_stmt);
        
        // Check if already registered
        $registered_query = "SELECT id FROM registrations WHERE user_id = ? AND event_id = ?";
        $registered_stmt = mysqli_prepare($conn, $registered_query);
        mysqli_stmt_bind_param($registered_stmt, "ii", $user_id, $event_id);
        mysqli_stmt_execute($registered_stmt);
        mysqli_stmt_store_result($registered_stmt);
        
        if (mysqli_stmt_num_rows($registered_stmt) > 0) {
            $response['message'] = 'You are already registered for this event';
            mysqli_stmt_close($registered_stmt);
            echo json_encode($response);
            exit();
        }
        mysqli_stmt_close($registered_stmt);
        
        // Register the user
        $insert_query = "INSERT INTO registrations (user_id, event_id, team_name, team_members, payment_status) 
                        VALUES (?, ?, ?, ?, 'completed')";
        $insert_stmt = mysqli_prepare($conn, $insert_query);
        mysqli_stmt_bind_param($insert_stmt, "iiss", $user_id, $event_id, $team_name, $team_members);
        
        if (mysqli_stmt_execute($insert_stmt)) {
            $response['success'] = true;
            $response['message'] = 'Successfully registered for the event!';
        } else {
            $response['message'] = 'Registration failed. Please try again.';
        }
        mysqli_stmt_close($insert_stmt);
        break;
        
    case 'get_my_registrations':
        // Get user's registrations
        $user_id = $_SESSION['user_id'];
        $query = "SELECT r.*, e.event_name, e.event_type, e.event_date, e.event_time, e.venue, e.registration_fee 
                  FROM registrations r 
                  JOIN events e ON r.event_id = e.id 
                  WHERE r.user_id = ? 
                  ORDER BY r.registration_date DESC";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $registrations = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $registrations[] = $row;
        }
        
        $response['success'] = true;
        $response['data'] = $registrations;
        mysqli_stmt_close($stmt);
        break;
        
    case 'cancel_registration':
        // Cancel event registration
        $user_id = $_SESSION['user_id'];
        $event_id = intval($_POST['event_id']);
        
        $query = "DELETE FROM registrations WHERE user_id = ? AND event_id = ?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "ii", $user_id, $event_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $response['success'] = true;
            $response['message'] = 'Registration cancelled successfully!';
        } else {
            $response['message'] = 'Failed to cancel registration';
        }
        mysqli_stmt_close($stmt);
        break;
        
    default:
        $response['message'] = 'Invalid action';
}

echo json_encode($response);
mysqli_close($conn);
?>