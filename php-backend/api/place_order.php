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

require '../vendor/autoload.php'; // Ensure this path is correct
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

     // Insert Admin Notifications (for all admins)
$adminMessage = "A new order #$order_id has been placed by $customer_name.";

$stmt = $conn->prepare("SELECT id FROM admins");
$stmt->execute();
$admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $conn->prepare("
    INSERT INTO admin_notifications (admin_id, order_id, message, read_status, created_at)
    VALUES (?, ?, ?, 0, NOW())
");
foreach ($admins as $admin) {
    $stmt->execute([$admin['id'], $order_id, $adminMessage]);
}

// Insert Warehouse Employee Notifications
// Step 1: Get the `id` of the role 'warehouse' from employee_roles
$stmt = $conn->prepare("SELECT id FROM employee_roles WHERE role_name = 'warehouse'");
$stmt->execute();
$role = $stmt->fetch(PDO::FETCH_ASSOC);

if ($role) {
    $warehouseRoleId = $role['id']; // use 'id' instead of 'role_id'

    // Step 2: Get all employees with this role_id
    $stmt = $conn->prepare("SELECT id FROM employees WHERE role_id = ?");
    $stmt->execute([$warehouseRoleId]);
    $warehouseEmployees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Step 3: Insert a notification for each warehouse employee
    $stmt = $conn->prepare("
        INSERT INTO notifications (employee_id, order_id, message, is_read, created_at)
        VALUES (?, ?, ?, 0, NOW())
    ");
    foreach ($warehouseEmployees as $employee) {
        $stmt->execute([$employee['id'], $order_id, $adminMessage]);
    }
}

    // Commit transaction
    $conn->commit();

    // Send confirmation email
    if (!empty($customer_email)) {
        $mail = new PHPMailer(true);
        try {
            // SMTP configuration
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com'; // Replace with your SMTP host
            $mail->SMTPAuth = true;
            $mail->Username = 'talha.awan2609@gmail.com'; // Replace with your SMTP username
            $mail->Password = 'gwwi zwgi bsxk inte'; // Replace with your SMTP password or app password
           $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('talha.awan2609@gmail.com', 'GenZstore'); // Replace with your sender info
            $mail->addAddress($customer_email, $customer_name);

            $mail->isHTML(true);
            $mail->Subject = 'Order Confirmation - Order #' . $order_id;

            // Build the email body
            $body = "<h2>Thank you for your order, {$customer_name}!</h2>";
            $body .= "<p>Your order ID is <strong>{$order_id}</strong>.</p>";
            $body .= "<h3>Order Details:</h3><ul>";
            foreach ($cart_items as $item) {
                $product_title = htmlspecialchars($item['product_title']);
                $quantity = (int)$item['quantity'];
                $unit_price = number_format($item['unit_price'], 2);
                $body .= "<li>{$product_title} - Qty: {$quantity} - Price: Rs {$unit_price}</li>";
            }
            $body .= "</ul>";
            $body .= "<p><strong>Total Amount:</strong> Rs " . number_format($total_amount, 2) . "</p>";
            $body .= "<p><strong>Shipping Address:</strong> {$shipping_address}</p>";
            if (!empty($order_notes)) {
                $body .= "<p><strong>Order Notes:</strong> {$order_notes}</p>";
            }
            $body .= "<p>We will notify you once your order is shipped.</p>";

            $mail->Body = $body;
            $mail->AltBody = "Thank you for your order. Your order ID is {$order_id}. Total Amount: Rs " . number_format($total_amount, 2);

            $mail->send();
        } catch (Exception $e) {
            // Log the error or handle it as needed
            error_log("Email could not be sent. Mailer Error: {$mail->ErrorInfo}");
        }
    }

    echo json_encode(['success' => true, 'order_id' => $order_id]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
