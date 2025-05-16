<?php
// place_order.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$customer_name = $data['customer_name'] ?? '';
$customer_email = $data['customer_email'] ?? '';
$customer_phone = $data['customer_phone'] ?? '';
$shipping_address = $data['shipping_address'] ?? '';
$order_notes = $data['order_notes'] ?? '';

if (!$user_id || !$customer_name || !$customer_phone || !$shipping_address) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

try {
    // Start transaction
    $conn->beginTransaction();

    // Fetch cart items
    $stmt = $conn->prepare("
        SELECT ci.*, p.title AS product_title
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $cart_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($cart_items)) {
        echo json_encode(['success' => false, 'message' => 'Cart is empty.']);
        exit;
    }

    // Calculate total amount
    $total_amount = 0;
    foreach ($cart_items as $item) {
        $total_amount += $item['unit_price'] * $item['quantity'];
    }

    // Insert into orders table
    $stmt = $conn->prepare("
        INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, order_notes, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user_id,
        $customer_name,
        $customer_email,
        $customer_phone,
        $shipping_address,
        $order_notes,
        $total_amount
    ]);
    $order_id = $conn->lastInsertId();

    // Insert into order_items table
 $stmt = $conn->prepare("
    INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?)
");
foreach ($cart_items as $item) {
    $stmt->execute([
        $order_id,
        $item['product_id'],
        $item['variant_id'], 
        $item['quantity'],
        $item['unit_price']
    ]);
}


    // Clear cart
    $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id = ?");
    $stmt->execute([$user_id]);

    // Commit transaction
    $conn->commit();

    echo json_encode(['success' => true, 'order_id' => $order_id]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
