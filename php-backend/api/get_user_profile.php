<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Fetch basic user information
    $stmt = $conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    // Fetch user addresses
    $stmt = $conn->prepare("SELECT * FROM addresses WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch order history
    $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch wishlist items
    $stmt = $conn->prepare("SELECT * FROM wishlist WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch cart items
    $stmt = $conn->prepare("SELECT * FROM cart WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // (Optional) Fetch recently viewed items or other features
    // $stmt = $conn->prepare("SELECT * FROM recently_viewed WHERE user_id = ?");
    // $stmt->execute([$user_id]);
    // $recently_viewed = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status'    => 'success',
        'user'      => $user,
        'addresses' => $addresses,
        'orders'    => $orders,
        'wishlist'  => $wishlist,
        'cart'      => $cart,
        // 'recently_viewed' => $recently_viewed
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
