<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include '../config/db.php';

// Ensure user is logged in
if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user']['id'];

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['email'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
    exit;
}

$username = trim($data['username']);
$email = trim($data['email']);

// Basic validation
if (empty($username) || empty($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Username and email are required']);
    exit;
}

try {
    // Optional: Check for duplicate email (if required)
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $checkStmt->execute([$email, $user_id]);
    if ($checkStmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Email already in use']);
        exit;
    }

    // Update user record
    $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
    $stmt->execute([$username, $email, $user_id]);

    echo json_encode(['status' => 'success', 'message' => 'Profile updated']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
