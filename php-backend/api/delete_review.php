<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (!isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$review_id = isset($data['review_id']) ? intval($data['review_id']) : null;
$userId = $_SESSION['user']['id'];

if (!$review_id) {
    echo json_encode(['success' => false, 'message' => 'Invalid review ID']);
    exit;
}

try {
    // Check if review belongs to the user
    $stmt = $conn->prepare("SELECT id FROM product_reviews WHERE id = ? AND user_id = ?");
    $stmt->execute([$review_id, $userId]);
    $review = $stmt->fetch();

    if (!$review) {
        echo json_encode(['success' => false, 'message' => 'Review not found or access denied']);
        exit;
    }

    // Delete the review
    $stmt = $conn->prepare("DELETE FROM product_reviews WHERE id = ?");
    $stmt->execute([$review_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
