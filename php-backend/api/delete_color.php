<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow the frontend origin
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../config/db.php';

// Check if 'id' parameter is provided
if (!isset($_GET['id']) || empty(trim($_GET['id']))) {
    echo json_encode(["status" => "error", "message" => "Color ID is required"]);
    exit;
}

$id = (int) $_GET['id'];

try {
    $stmt = $conn->prepare("DELETE FROM colors WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Color deleted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid ID or color not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
