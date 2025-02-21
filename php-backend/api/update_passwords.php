<?php
require_once '../config/db.php'; // Ensure this points to your database connection

try {
    // Fetch all admins with plaintext passwords
    $stmt = $conn->query("SELECT id, password FROM admins");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($admins as $admin) {
        $hashedPassword = password_hash($admin['password'], PASSWORD_DEFAULT);

        // Update database with hashed password
        $updateStmt = $conn->prepare("UPDATE admins SET password = ? WHERE id = ?");
        $updateStmt->execute([$hashedPassword, $admin['id']]);

        echo "Updated password for admin ID: " . $admin['id'] . "<br>";
    }

    echo "✅ Passwords updated successfully!";
} catch (Exception $e) {
    echo "❌ Error updating passwords: " . $e->getMessage();
}
?>
