<?php
// Enable full error reporting for debugging
error_reporting(E_ALL);
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);

// Handle preflight CORS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    http_response_code(200);
    exit();
}

// Include DB connection
require_once '../config/db.php';

// Helper for logging with timestamp
function log_debug($message) {
    file_put_contents('log.txt', "[" . date('Y-m-d H:i:s') . "] $message\n", FILE_APPEND);
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// Parse and validate JSON input
$data = json_decode(file_get_contents("php://input"), true);
log_debug("RAW INPUT: " . print_r($data, true));

if (!$data) {
    http_response_code(400);
    log_debug("Invalid JSON input");
    echo json_encode(["success" => false, "message" => "Invalid JSON."]);
    exit;
}

// Extract and sanitize input
$product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;
$user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
$rating = isset($data['rating']) ? (int)$data['rating'] : 0;
$comment = isset($data['comment']) ? trim($data['comment']) : '';

log_debug("Parsed values:\nproduct_id: $product_id\nuser_id: $user_id\nrating: $rating\ncomment: $comment");

if (!$product_id || !$user_id || !$rating || !$comment) {
    http_response_code(400);
    log_debug("Validation Failed: Missing data");
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

if ($rating < 1 || $rating > 5) {
    http_response_code(400);
    log_debug("Validation Failed: Invalid rating value");
    echo json_encode(["success" => false, "message" => "Rating must be between 1 and 5."]);
    exit;
}

// Sanitize comment
$comment = htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');

// Check for existing review
$stmt = $conn->prepare("SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?");
if (!$stmt) {
    http_response_code(500);
    log_debug("Prepare failed on SELECT: " . $conn->errorInfo()[2]);
    echo json_encode(["success" => false, "message" => "Prepare failed."]);
    exit;
}

// Use bindValue() instead of bind_param() for PDO
$stmt->bindValue(1, $product_id, PDO::PARAM_INT);
$stmt->bindValue(2, $user_id, PDO::PARAM_INT);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
log_debug("SELECT executed. Rows: " . ($result ? count($result) : 0));

if ($result) {
    http_response_code(409);
    log_debug("Duplicate review found.");
    echo json_encode(["success" => false, "message" => "You already reviewed this product."]);
    $stmt->closeCursor();
    $conn = null;
    exit;
}
$stmt->closeCursor();

// Insert new review
$stmt = $conn->prepare("INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    log_debug("Prepare failed on INSERT: " . $conn->errorInfo()[2]);
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->errorInfo()[2]]);
    exit;
}

// Use bindValue() instead of bind_param() for PDO
$stmt->bindValue(1, $product_id, PDO::PARAM_INT);
$stmt->bindValue(2, $user_id, PDO::PARAM_INT);
$stmt->bindValue(3, $rating, PDO::PARAM_INT);
$stmt->bindValue(4, $comment, PDO::PARAM_STR);

if ($stmt->execute()) {
    http_response_code(201);
    log_debug("INSERT successful. Insert ID: " . $conn->lastInsertId());
    echo json_encode([
        "success" => true,
        "message" => "Review submitted.",
        "review_id" => $conn->lastInsertId()
    ]);
} else {
    http_response_code(500);
    log_debug("INSERT failed: " . $stmt->errorInfo()[2]);
    echo json_encode(["success" => false, "message" => "Execute failed: " . $stmt->errorInfo()[2]]);
}

$stmt->closeCursor();
$conn = null;

?>
