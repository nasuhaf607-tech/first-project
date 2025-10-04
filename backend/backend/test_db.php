<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dbuser";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'tbuser'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode(['status' => 'error', 'message' => 'Table tbuser does not exist']);
        exit;
    }
    
    // Get table structure
    $stmt = $pdo->query("DESCRIBE tbuser");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get all users
    $stmt = $pdo->query("SELECT * FROM tbuser");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get drivers specifically
    $stmt = $pdo->query("SELECT * FROM tbuser WHERE userType = 'Driver'");
    $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'table_exists' => $tableExists,
        'columns' => $columns,
        'total_users' => count($users),
        'total_drivers' => count($drivers),
        'drivers' => $drivers,
        'all_users' => $users
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


