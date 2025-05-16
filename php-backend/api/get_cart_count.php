<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
session_start();
require_once '../config/db.php';

// Check if the user is logged in
if (!isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => true, 'count' => 0]);
    exit;
}

$userId = $_SESSION['user']['id'];

try {
    // Count total quantity of items in cart for the user
    $stmt = $conn->prepare("SELECT SUM(quantity) AS total FROM cart_items WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $userId]);
    $result = $stmt->fetch();

    $count = $result['total'] ?? 0;

    echo json_encode(['success' => true, 'count' => (int)$count]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
