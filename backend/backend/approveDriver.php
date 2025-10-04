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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $driverEmail = $input['driverEmail'] ?? null;
    $action = $input['action'] ?? null;

    if (!$driverEmail || !$action) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
        exit;
    }

    if (!in_array($action, ['approved', 'rejected', 'pending'])) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        exit;
    }

    try {
        // Check if status and updatedAt columns exist, if not create them
        $checkStatus = $pdo->query("SHOW COLUMNS FROM tbuser LIKE 'status'");
        if ($checkStatus->rowCount() == 0) {
            $pdo->query("ALTER TABLE tbuser ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
        }
        
        $checkUpdatedAt = $pdo->query("SHOW COLUMNS FROM tbuser LIKE 'updatedAt'");
        if ($checkUpdatedAt->rowCount() == 0) {
            $pdo->query("ALTER TABLE tbuser ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }

        // Update driver status
        $stmt = $pdo->prepare("UPDATE tbuser SET status = ?, updatedAt = NOW() WHERE email = ? AND userType = 'Driver'");
        $stmt->execute([$action, $driverEmail]);

        if ($stmt->rowCount() === 0) {
            echo json_encode(['status' => 'error', 'message' => 'Driver not found']);
            exit;
        }

        // Get driver details for email notification
        $stmt = $pdo->prepare("SELECT * FROM tbuser WHERE email = ?");
        $stmt->execute([$driverEmail]);
        $driver = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($driver) {
            // Send email notification
            $subject = "Driver Application " . ucfirst($action);
            $message = "Dear " . $driver['name'] . ",\n\n";
            
            if ($action === 'approved') {
                $message .= "Congratulations! Your driver application has been approved by JKM.\n";
                $message .= "You can now login to your driver dashboard and start providing services.\n\n";
                $message .= "Login at: http://localhost/first-project/\n\n";
            } elseif ($action === 'rejected') {
                $message .= "We regret to inform you that your driver application has been rejected.\n";
                $message .= "Please contact JKM for more information about the rejection.\n\n";
            } elseif ($action === 'pending') {
                $message .= "Your driver application status has been reset to pending review.\n";
                $message .= "JKM will review your application again. Please wait for further notification.\n\n";
            }
            
            $message .= "Thank you for your interest in joining our OKU Transport Service.\n\n";
            $message .= "Best regards,\nJKM Team";

            $headers = "From: jkm@okutransport.com\r\n";
            $headers .= "Reply-To: jkm@okutransport.com\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

            // Send email (in production, use a proper email service)
            $emailSent = mail($driver['email'], $subject, $message, $headers);
            
            // Log email attempt for debugging
            error_log("Email sent to {$driver['email']}: " . ($emailSent ? 'SUCCESS' : 'FAILED'));
            
            // If email fails, log the details but don't fail the approval
            if (!$emailSent) {
                error_log("Email sending failed. Subject: $subject, To: {$driver['email']}");
            }
            
            // Save email notification to file for testing (since local mail() might not work)
            $emailLog = "=== EMAIL NOTIFICATION ===\n";
            $emailLog .= "Date: " . date('Y-m-d H:i:s') . "\n";
            $emailLog .= "To: " . $driver['email'] . "\n";
            $emailLog .= "Subject: " . $subject . "\n";
            $emailLog .= "Message:\n" . $message . "\n";
            $emailLog .= "========================\n\n";
            
            file_put_contents('../email_notifications.log', $emailLog, FILE_APPEND | LOCK_EX);
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Driver ' . $action . ' successfully! Email notification attempted.'
        ]);

    } catch(PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
