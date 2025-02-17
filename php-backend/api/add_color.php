<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

include '../config/db.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get JSON input data
$input = file_get_contents("php://input");
file_put_contents("debug.log", $input); // Debugging

$data = json_decode($input, true);

if (!isset($data['color_name']) || empty(trim($data['color_name']))) {
    echo json_encode(["status" => "error", "message" => "Color name is required"]);
    exit;
}

$color_name = trim($data['color_name']);

try {
    $stmt = $conn->prepare("INSERT INTO colors (color_name) VALUES (:color_name)");
    $stmt->bindParam(':color_name', $color_name, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Color added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add color"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
