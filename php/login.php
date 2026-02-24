<?php
/**
 * Login Authentication Handler
 * College Fest Management System
 */

require_once 'config.php';

// Initialize response array
$response = array('success' => false, 'message' => '', 'role' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize input
    $email = sanitize_input($_POST['email']);
    $password = $_POST['password'];
    
    // Validate input
    if (empty($email) || empty($password)) {
        $response['message'] = 'Please fill in all fields';
        echo json_encode($response);
        exit();
    }
    
    // Check if email exists
    $query = "SELECT id, name, email, password, role, college FROM users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 1) {
        $user = mysqli_fetch_assoc($result);
        
        // Verify password (Plain text comparison)
        if ($password === $user['password']) {
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['college'] = $user['college'];
            
            $response['success'] = true;
            $response['message'] = 'Login successful!';
            $response['role'] = $user['role'];
        } else {
            $response['message'] = 'Invalid email or password';
        }
    } else {
        $response['message'] = 'Invalid email or password';
    }
    
    mysqli_stmt_close($stmt);
}

echo json_encode($response);
mysqli_close($conn);
?>