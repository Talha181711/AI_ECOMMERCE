<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

$stmt = $conn->prepare("DELETE FROM employees WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
