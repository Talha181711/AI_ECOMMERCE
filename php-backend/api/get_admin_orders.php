<?php
// get_admin_orders.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

session_start();
include '../config/db.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

try {
    // Count total orders
    $countStmt = $conn->query("SELECT COUNT(*) FROM orders");
    $total_orders = $countStmt->fetchColumn();

    // Fetch paginated orders with status name
    $stmt = $conn->prepare("
        SELECT o.*, os.status_name AS order_status 
        FROM orders o
        JOIN order_status os ON o.order_status_id = os.id
        ORDER BY o.created_at DESC 
        LIMIT ? OFFSET ?
    ");
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();
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

    echo json_encode([
        'status' => 'success',
        'total_orders' => $total_orders,
        'page' => $page,
        'limit' => $limit,
        'orders' => $orders
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
