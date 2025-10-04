<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dbuser";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

try {
    // Check if status column exists, if not create it
    $checkStatus = $pdo->query("SHOW COLUMNS FROM tbuser LIKE 'status'");
    if ($checkStatus->rowCount() == 0) {
        $pdo->query("ALTER TABLE tbuser ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
    }
    
    $checkCreatedAt = $pdo->query("SHOW COLUMNS FROM tbuser LIKE 'createdAt'");
    if ($checkCreatedAt->rowCount() == 0) {
        $pdo->query("ALTER TABLE tbuser ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }
    
    $checkUpdatedAt = $pdo->query("SHOW COLUMNS FROM tbuser LIKE 'updatedAt'");
    if ($checkUpdatedAt->rowCount() == 0) {
        $pdo->query("ALTER TABLE tbuser ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    }

    // Get pending drivers
    $stmt = $pdo->prepare("SELECT * FROM tbuser WHERE userType = 'Driver' AND (status = 'pending' OR status IS NULL) ORDER BY createdAt DESC");
    $stmt->execute();
    $pendingDrivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get approved drivers
    $stmt = $pdo->prepare("SELECT * FROM tbuser WHERE userType = 'Driver' AND status = 'approved' ORDER BY updatedAt DESC");
    $stmt->execute();
    $approvedDrivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get rejected drivers
    $stmt = $pdo->prepare("SELECT * FROM tbuser WHERE userType = 'Driver' AND status = 'rejected' ORDER BY updatedAt DESC");
    $stmt->execute();
    $rejectedDrivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'pending' => $pendingDrivers,
        'approved' => $approvedDrivers,
        'rejected' => $rejectedDrivers,
        'debug' => [
            'pending_count' => count($pendingDrivers),
            'approved_count' => count($approvedDrivers),
            'rejected_count' => count($rejectedDrivers)
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
