<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include '../config/db.php';

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

$user_id = $_SESSION['user']['id'];

try {
    $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $stmtItems = $conn->prepare("
            SELECT 
                oi.*, 
                p.title AS product_title, 
                c.color_name AS color_name, 
                s.size AS size_name,
                image_url AS product_image
            FROM order_items oi
            JOIN product_variants pv ON pv.id = oi.variant_id
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN colors c ON c.id = pv.color_id
            LEFT JOIN sizes s ON s.id = pv.size_id
            LEFT JOIN product_images pci 
                ON pci.product_id = pv.product_id AND pci.color_id = pv.color_id
            WHERE oi.order_id = ?
            GROUP BY oi.id
        ");
        $stmtItems->execute([$order['id']]);
        $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
