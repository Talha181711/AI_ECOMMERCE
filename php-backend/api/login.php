<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../config/db.php';  // Ensure this file does not output anything!

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate that email and password exist
    if (!isset($data['email'], $data['password'])) {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Email and password are required'
        ]);
        exit;
    }

    // Use a prepared statement with PDO
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data['password'], $user['password'])) {
        // Set session variables for id, username, and email
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];

        echo json_encode([
            'status' => 'success',
            'user'   => $user
        ]);
    } else {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Invalid credentials'
        ]);
    }
}
?>
