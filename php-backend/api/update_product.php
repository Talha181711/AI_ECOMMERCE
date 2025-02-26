<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include '../config/db.php';

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    $productId = $_POST['id'] ?? null;
    if (!$productId || !is_numeric($productId)) {
        throw new Exception("Invalid product ID");
    }

    // Validate required fields
    $required = ['title', 'description', 'price', 'category_id', 'subcategory_id', 'brand_id', 'variants'];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $conn->beginTransaction();

    // Check if product data has changed before updating
    $checkStmt = $conn->prepare("
        SELECT title, description, price, category_id, subcategory_id, brand_id
        FROM products WHERE id = ?
    ");
    $checkStmt->execute([$productId]);
    $existingProduct = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (
        $existingProduct['title'] !== $_POST['title'] ||
        $existingProduct['description'] !== $_POST['description'] ||
        $existingProduct['price'] !== $_POST['price'] ||
        $existingProduct['category_id'] != $_POST['category_id'] ||
        $existingProduct['subcategory_id'] != $_POST['subcategory_id'] ||
        $existingProduct['brand_id'] != $_POST['brand_id']
    ) {
        // Update product details only if there are changes
        $stmt = $conn->prepare("
            UPDATE products SET
                title = ?,
                description = ?,
                price = ?,
                category_id = ?,
                subcategory_id = ?,
                brand_id = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $_POST['title'],
            $_POST['description'],
            $_POST['price'],
            $_POST['category_id'],
            $_POST['subcategory_id'],
            $_POST['brand_id'],
            $productId
        ]);
    }

    // Handle image deletions
    if (!empty($_POST['images_to_delete'])) {
        $imagesToDelete = json_decode($_POST['images_to_delete'], true);
        if (!empty($imagesToDelete)) {
            foreach ($imagesToDelete as $image) {
                $filePath = "../uploads/" . $image;
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            $placeholders = rtrim(str_repeat('?,', count($imagesToDelete)), ',');
            $deleteStmt = $conn->prepare("DELETE FROM product_images WHERE image_url IN ($placeholders)");
            $deleteStmt->execute($imagesToDelete);
        }
    }

    // Handle new images
    if (!empty($_FILES['new_images']['name'][0])) {
        $uploadDir = "../uploads/";
        $imageStmt = $conn->prepare("INSERT INTO product_images (product_id, color_id, image_url) VALUES (?, ?, ?)");

        foreach ($_FILES['new_images']['name'] as $index => $fileName) {
            if ($_FILES['new_images']['error'][$index] === UPLOAD_ERR_OK) {
                $tmpName = $_FILES['new_images']['tmp_name'][$index];
                $filename = uniqid() . '_' . basename($fileName);
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($tmpName, $targetPath)) {
                    $colorId = $_POST['new_image_color_ids'][$index];
                    $imageStmt->execute([$productId, $colorId, $filename]);
                }
            }
        }
    }

    // Handle existing images (Avoid Duplicates)
    if (!empty($_POST['existing_images']) && !empty($_POST['existing_image_color_ids'])) {
        $existingImages = $_POST['existing_images'];
        $existingColorIds = $_POST['existing_image_color_ids'];

        if (count($existingImages) === count($existingColorIds)) {
            foreach ($existingImages as $index => $image) {
                $checkImageStmt = $conn->prepare("
                    SELECT id, color_id FROM product_images WHERE product_id = ? AND image_url = ?
                ");
                $checkImageStmt->execute([$productId, $image]);
                $existingImage = $checkImageStmt->fetch(PDO::FETCH_ASSOC);

                if ($existingImage) {
                    // Update color_id only if it's changed
                    if ($existingImage['color_id'] != $existingColorIds[$index]) {
                        $updateImageStmt = $conn->prepare("
                            UPDATE product_images SET color_id = ? WHERE id = ?
                        ");
                        $updateImageStmt->execute([$existingColorIds[$index], $existingImage['id']]);
                    }
                } else {
                    // Insert new image
                    $imageStmt = $conn->prepare("
                        INSERT INTO product_images (product_id, color_id, image_url)
                        VALUES (?, ?, ?)
                    ");
                    $imageStmt->execute([$productId, $existingColorIds[$index], $image]);
                }
            }
        }
    }

    // Update variants safely
    $variants = json_decode($_POST['variants'], true);

    foreach ($variants as $variant) {
        $checkStmt = $conn->prepare("
            SELECT id, stock FROM product_variants 
            WHERE product_id = ? AND color_id = ? AND size_id = ?
        ");
        $checkStmt->execute([$productId, $variant['color_id'], $variant['size_id']]);
        $existingVariant = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingVariant) {
            // Update stock only if it has changed
            if ($existingVariant['stock'] != $variant['stock']) {
                $updateStmt = $conn->prepare("
                    UPDATE product_variants 
                    SET stock = ? 
                    WHERE id = ?
                ");
                $updateStmt->execute([$variant['stock'], $existingVariant['id']]);
            }
        } else {
            // Insert new variant if it doesn't exist
            $variantStmt = $conn->prepare("
                INSERT INTO product_variants (product_id, color_id, size_id, stock)
                VALUES (?, ?, ?, ?)
            ");
            $variantStmt->execute([$productId, $variant['color_id'], $variant['size_id'], $variant['stock']]);
        }
    }

    $conn->commit();
    $response = ['success' => true, 'message' => 'Product updated successfully'];
} catch (Exception $e) {
    $conn->rollBack();
    $response['message'] = $e->getMessage();

}

echo json_encode($response);
?>
