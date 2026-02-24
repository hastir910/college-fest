<?php
/**
 * Get Current User Profile
 * College Fest Management System
 */

require_once 'config.php';

// Check if user is logged in
if (!is_logged_in()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

$response = array('success' => false, 'message' => '', 'data' => null);

try {
    $user_id = $_SESSION['user_id'];
    
    // Get user profile data
    $query = "SELECT id, name, email, phone, college, role, created_at FROM users WHERE id = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        $response['success'] = true;
        $response['data'] = $row;
        $response['message'] = 'Profile loaded successfully';
    } else {
        $response['message'] = 'User not found';
    }
    
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Error loading profile: ' . $e->getMessage();
    error_log("get_profile error: " . $e->getMessage());
}

echo json_encode($response);
mysqli_close($conn);
?>