<?php
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$name = $data['name'];
$email = $data['email'];
$role = $data['role'];

$stmt = $conn->prepare("UPDATE employees SET name = ?, email = ?, role = ? WHERE id = ?");
$stmt->bind_param("sssi", $name, $email, $role, $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
