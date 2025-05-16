<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Hide errors from frontend but log them
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// ✅ Unified way to fetch user ID from session
$user_id = $_SESSION['user_id'] ?? ($_SESSION['user']['id'] ?? null);

if (!$user_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access. User ID not found in session.',
        'debug' => [
            'session' => $_SESSION,
            'cookies' => $_COOKIE
        ]
    ]);
    exit;
}

include '../config/db.php';

// ✅ Decode input and sanitize
$data = json_decode(file_get_contents('php://input'), true);
$review_id = isset($data['review_id']) ? intval($data['review_id']) : null;
$rating = isset($data['rating']) ? intval($data['rating']) : null;
$comment = isset($data['comment']) ? trim($data['comment']) : '';

if (!$review_id || !$rating || empty($comment)) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

try {
    // ✅ Check review ownership
    $stmt = $conn->prepare("SELECT id FROM product_reviews WHERE id = ? AND user_id = ?");
    $stmt->execute([$review_id, $user_id]);
    $review = $stmt->fetch();

    if (!$review) {
        echo json_encode(['success' => false, 'message' => 'Review not found or access denied']);
        exit;
    }

    // ✅ Perform update
    $stmt = $conn->prepare("UPDATE product_reviews SET rating = ?, comment = ? WHERE id = ?");
    $stmt->execute([$rating, $comment, $review_id]);

    echo json_encode(['success' => true, 'message' => 'Review updated successfully']);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
