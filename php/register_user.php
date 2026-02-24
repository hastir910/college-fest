<?php
/**
 * User Registration Handler
 * College Fest Management System
 */

require_once 'config.php';

$response = array('success' => false, 'message' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize input
    $name = sanitize_input($_POST['name']);
    $email = sanitize_input($_POST['email']);
    $password = $_POST['password'];
    $phone = sanitize_input($_POST['phone']);
    $college = sanitize_input($_POST['college']);
    
    // Validate input
    if (empty($name) || empty($email) || empty($password) || empty($phone) || empty($college)) {
        $response['message'] = 'Please fill in all fields';
        echo json_encode($response);
        exit();
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Invalid email format';
        echo json_encode($response);
        exit();
    }
    
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = ?";
    $check_stmt = mysqli_prepare($conn, $check_query);
    mysqli_stmt_bind_param($check_stmt, "s", $email);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);
    
    if (mysqli_stmt_num_rows($check_stmt) > 0) {
        $response['message'] = 'Email already registered';
        mysqli_stmt_close($check_stmt);
        echo json_encode($response);
        exit();
    }
    mysqli_stmt_close($check_stmt);
    
    // Use plain text password (not hashed)
    $plain_password = $password;
    
    // Insert new user
    $insert_query = "INSERT INTO users (name, email, password, phone, college, role) VALUES (?, ?, ?, ?, ?, 'user')";
    $insert_stmt = mysqli_prepare($conn, $insert_query);
    mysqli_stmt_bind_param($insert_stmt, "sssss", $name, $email, $plain_password, $phone, $college);
    
    if (mysqli_stmt_execute($insert_stmt)) {
        $response['success'] = true;
        $response['message'] = 'Registration successful! You can now login.';
    } else {
        $response['message'] = 'Registration failed. Please try again.';
    }
    
    mysqli_stmt_close($insert_stmt);
}

echo json_encode($response);
mysqli_close($conn);
?>