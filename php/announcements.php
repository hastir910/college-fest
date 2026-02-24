<?php
/**
 * Announcements Handler
 * College Fest Management System
 */

require_once 'config.php';

$response = array('success' => false, 'message' => '', 'data' => null);
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

switch ($action) {
    case 'get_announcements':
        // Fetch all announcements
        $query = "SELECT a.*, u.name as created_by_name 
                  FROM announcements a 
                  JOIN users u ON a.created_by = u.id 
                  ORDER BY a.created_at DESC";
        $result = mysqli_query($conn, $query);
        
        $announcements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $announcements[] = $row;
        }
        
        $response['success'] = true;
        $response['data'] = $announcements;
        break;
        
    case 'add_announcement':
        // Add new announcement (Admin only)
        if (!is_logged_in() || !is_admin()) {
            $response['message'] = 'Unauthorized access';
            echo json_encode($response);
            exit();
        }
        
        $title = sanitize_input($_POST['title']);
        $content = sanitize_input($_POST['content']);
        $priority = sanitize_input($_POST['priority']);
        $created_by = $_SESSION['user_id'];
        
        $query = "INSERT INTO announcements (title, content, priority, created_by) VALUES (?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "sssi", $title, $content, $priority, $created_by);
        
        if (mysqli_stmt_execute($stmt)) {
            $response['success'] = true;
            $response['message'] = 'Announcement added successfully!';
        } else {
            $response['message'] = 'Failed to add announcement';
        }
        mysqli_stmt_close($stmt);
        break;
        
    case 'delete_announcement':
        // Delete announcement (Admin only)
        if (!is_logged_in() || !is_admin()) {
            $response['message'] = 'Unauthorized access';
            echo json_encode($response);
            exit();
        }
        
        $announcement_id = intval($_POST['announcement_id']);
        
        $query = "DELETE FROM announcements WHERE id = ?";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, "i", $announcement_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $response['success'] = true;
            $response['message'] = 'Announcement deleted successfully!';
        } else {
            $response['message'] = 'Failed to delete announcement';
        }
        mysqli_stmt_close($stmt);
        break;
        
    default:
        $response['message'] = 'Invalid action';
}

echo json_encode($response);
mysqli_close($conn);
?>