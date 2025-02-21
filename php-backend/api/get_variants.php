<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

require_once '../config/db.php';

try {
    if (!isset($conn)) {
        throw new Exception("Database connection is not established.");
    }

    $query = "SELECT * FROM product_variants";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($variants)) {
        echo json_encode(['status' => 'success', 'variants' => $variants]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No variants found']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
