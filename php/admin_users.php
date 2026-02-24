<?php
/**
 * Admin Users Management Handler
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
    case 'get_users':
        try {
            // Fetch all users
            $query = "SELECT u.id, u.name, u.email, u.phone, u.college, u.role, u.created_at,
                      (SELECT COUNT(*) FROM registrations WHERE user_id = u.id) as event_count
                      FROM users u 
                      ORDER BY u.created_at DESC";
            $result = mysqli_query($conn, $query);
            
            if (!$result) {
                throw new Exception("Database query failed: " . mysqli_error($conn));
            }
            
            $users = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $users[] = $row;
            }
            
            $response['success'] = true;
            $response['data'] = $users;
            $response['message'] = count($users) . ' users found';
            
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = 'Error loading users: ' . $e->getMessage();
            error_log("get_users error: " . $e->getMessage());
        }
        break;
        
    case 'delete_user':
        try {
            // Delete user
            $user_id = intval($_POST['user_id']);
            
            // Prevent admin from deleting themselves
            if ($user_id == $_SESSION['user_id']) {
                $response['message'] = 'You cannot delete your own account';
                echo json_encode($response);
                exit();
            }
            
            $query = "DELETE FROM users WHERE id = ?";
            $stmt = mysqli_prepare($conn, $query);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . mysqli_error($conn));
            }
            
            mysqli_stmt_bind_param($stmt, "i", $user_id);
            
            if (mysqli_stmt_execute($stmt)) {
                $response['success'] = true;
                $response['message'] = 'User deleted successfully!';
            } else {
                throw new Exception("Delete failed: " . mysqli_stmt_error($stmt));
            }
            
            mysqli_stmt_close($stmt);
            
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = 'Error deleting user: ' . $e->getMessage();
            error_log("delete_user error: " . $e->getMessage());
        }
        break;
        
    case 'get_registrations':
        try {
            // Get all event registrations
            $query = "SELECT r.id, r.registration_date, r.payment_status, r.team_name,
                      u.name as user_name, u.email, u.college,
                      e.event_name, e.event_date, e.registration_fee
                      FROM registrations r
                      JOIN users u ON r.user_id = u.id
                      JOIN events e ON r.event_id = e.id
                      ORDER BY r.registration_date DESC";
            $result = mysqli_query($conn, $query);
            
            if (!$result) {
                throw new Exception("Database query failed: " . mysqli_error($conn));
            }
            
            $registrations = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $registrations[] = $row;
            }
            
            $response['success'] = true;
            $response['data'] = $registrations;
            $response['message'] = count($registrations) . ' registrations found';
            
        } catch (Exception $e) {
            $response['success'] = false;
            $response['message'] = 'Error loading registrations: ' . $e->getMessage();
            error_log("get_registrations error: " . $e->getMessage());
        }
        break;
        
    default:
        $response['success'] = false;
        $response['message'] = 'Invalid action specified';
}

echo json_encode($response);
mysqli_close($conn);
?>