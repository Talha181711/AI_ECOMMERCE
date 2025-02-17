<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Execute the query using PDO
$result = $conn->query("SELECT * FROM users WHERE id = $user_id");

// Fetch the result as an associative array using PDO::FETCH_ASSOC
$user = $result->fetch(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'user' => $user]);
?>
