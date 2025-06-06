<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow the frontend origin
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include '../config/db.php';

// Read POST data
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['size']) || empty(trim($data['size']))) {
    echo json_encode(["status" => "error", "message" => "Size is required"]);
    exit;
}

$size = trim($data['size']);

try {
    $stmt = $conn->prepare("INSERT INTO sizes (size) VALUES (:size)");
    $stmt->bindParam(':size', $size, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Size added successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add size"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
