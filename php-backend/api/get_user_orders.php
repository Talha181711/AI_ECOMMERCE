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
    // ✅ Get orders with status_name, no order_status_id
    $stmt = $conn->prepare("
        SELECT 
            o.*, 
            os.status_name AS order_status_name 
        FROM orders o 
        JOIN order_status os ON o.order_status_id = os.id 
        WHERE o.user_id = ? 
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        // ✅ Remove the numeric order_status_id from the response
        unset($order['order_status_id']);

        // ✅ Fetch items for each order
        $stmtItems = $conn->prepare("
            SELECT 
                oi.*, 
                p.title AS product_title, 
                c.color_name AS color_name, 
                s.size AS size_name,
                pci.image_url AS product_image,
                os.status_name AS order_status_name
            FROM order_items oi
            JOIN product_variants pv ON pv.id = oi.variant_id
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN colors c ON c.id = pv.color_id
            LEFT JOIN sizes s ON s.id = pv.size_id
            LEFT JOIN product_images pci 
                ON pci.product_id = pv.product_id AND pci.color_id = pv.color_id
            JOIN orders o ON o.id = oi.order_id
            JOIN order_status os ON os.id = o.order_status_id
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
