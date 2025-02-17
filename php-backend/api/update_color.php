<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow the frontend origin
header("Access-Control-Allow-Origin: http://localhost:5173"); // Replace with your frontend URL if different
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE, OPTIONS"); // Ensure PUT is allowed
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept"); // Allow necessary headers

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../config/db.php';

// Read the raw POST data (for JSON data)
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validate input
if (!isset($data['id']) || !isset($data['color_name']) || empty(trim($data['color_name']))) {
    echo json_encode(["status" => "error", "message" => "ID and Color name are required"]);
    exit;
}

$id = (int) $data['id'];
$color_name = trim($data['color_name']);

try {
    $stmt = $conn->prepare("UPDATE colors SET color_name = :color_name WHERE id = :id");
    $stmt->bindParam(':color_name', $color_name, PDO::PARAM_STR);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    // Execute and check for success
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "Color updated successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "No changes made or invalid ID"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Query execution failed"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
