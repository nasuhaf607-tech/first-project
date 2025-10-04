<?php
// Disable error display to prevent HTML output in JSON response
ini_set('display_errors', 0);
error_reporting(E_ALL);
// Log errors to file instead of displaying them
ini_set('log_errors', 1);
ini_set('error_log', '../error.log');

// Set error handler to return JSON instead of HTML
set_error_handler(function($severity, $message, $file, $line) {
    error_log("PHP Error: $message in $file on line $line");
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error occurred"]);
    exit();
});

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Log registration attempts for debugging
error_log("Driver registration attempt - Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));

try {
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

// Check if it's a form data request (driver registration) or JSON request (regular registration)
if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
    // Handle driver registration with file uploads
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $password = $_POST['password'] ?? '';
    $userType = $_POST['userType'] ?? 'Driver';
    $status = $_POST['status'] ?? 'pending';
    
    // Driver-specific fields
    $icNumber = $_POST['icNumber'] ?? '';
    $licenseNumber = $_POST['licenseNumber'] ?? '';
    $vehicleType = $_POST['vehicleType'] ?? '';
    $vehicleNumber = $_POST['vehicleNumber'] ?? '';
    $address = $_POST['address'] ?? '';
    $emergencyContact = $_POST['emergencyContact'] ?? '';
    $emergencyPhone = $_POST['emergencyPhone'] ?? '';
    $experience = $_POST['experience'] ?? '';
    $languages = $_POST['languages'] ?? '';
    $availability = $_POST['availability'] ?? '';
    
    // Handle file uploads
    $icPhoto = '';
    $selfiePhoto = '';
    $licensePhoto = '';
    $vehiclePhoto = '';
    
    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Process IC Photo
    if (isset($_FILES['icPhoto']) && $_FILES['icPhoto']['error'] === UPLOAD_ERR_OK) {
        if (in_array($_FILES['icPhoto']['type'], $allowedTypes) && $_FILES['icPhoto']['size'] <= $maxFileSize) {
            $icPhoto = 'ic_' . time() . '_' . basename($_FILES['icPhoto']['name']);
            move_uploaded_file($_FILES['icPhoto']['tmp_name'], $uploadDir . $icPhoto);
        }
    }
    
    // Process Selfie Photo
    if (isset($_FILES['selfiePhoto']) && $_FILES['selfiePhoto']['error'] === UPLOAD_ERR_OK) {
        if (in_array($_FILES['selfiePhoto']['type'], $allowedTypes) && $_FILES['selfiePhoto']['size'] <= $maxFileSize) {
            $selfiePhoto = 'selfie_' . time() . '_' . basename($_FILES['selfiePhoto']['name']);
            move_uploaded_file($_FILES['selfiePhoto']['tmp_name'], $uploadDir . $selfiePhoto);
        }
    }
    
    // Process License Photo
    if (isset($_FILES['licensePhoto']) && $_FILES['licensePhoto']['error'] === UPLOAD_ERR_OK) {
        if (in_array($_FILES['licensePhoto']['type'], $allowedTypes) && $_FILES['licensePhoto']['size'] <= $maxFileSize) {
            $licensePhoto = 'license_' . time() . '_' . basename($_FILES['licensePhoto']['name']);
            move_uploaded_file($_FILES['licensePhoto']['tmp_name'], $uploadDir . $licensePhoto);
        }
    }
    
    // Process Vehicle Photo
    if (isset($_FILES['vehiclePhoto']) && $_FILES['vehiclePhoto']['error'] === UPLOAD_ERR_OK) {
        if (in_array($_FILES['vehiclePhoto']['type'], $allowedTypes) && $_FILES['vehiclePhoto']['size'] <= $maxFileSize) {
            $vehiclePhoto = 'vehicle_' . time() . '_' . basename($_FILES['vehiclePhoto']['name']);
            move_uploaded_file($_FILES['vehiclePhoto']['tmp_name'], $uploadDir . $vehiclePhoto);
        }
    }
    
} else {
    // Handle regular registration (JSON)
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!$input) {
        echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
        exit;
    }
    
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $password = $input['password'] ?? '';
    $userType = $input['userType'] ?? 'OKU User';
    $status = 'active'; // Regular users are active by default
}

// Validate required fields
if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "All required fields must be filled"]);
    exit();
}

// Additional validation for driver registration
if ($userType === 'Driver') {
    if (empty($icNumber) || empty($licenseNumber) || empty($vehicleType) || empty($vehicleNumber) || empty($address) || empty($emergencyContact) || empty($emergencyPhone) || empty($experience) || empty($availability)) {
        echo json_encode(["status" => "error", "message" => "All driver-specific fields must be filled"]);
        exit();
    }
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "dbuser");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Check if email already exists
$stmt = $conn->prepare("SELECT * FROM tbuser WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already registered"]);
    exit();
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

if ($userType === 'Driver') {
    // First, check if the table has the required columns, if not, add them
    $columns = ['status', 'icNumber', 'licenseNumber', 'vehicleType', 'vehicleNumber', 'address', 'emergencyContact', 'emergencyPhone', 'experience', 'languages', 'availability', 'icPhoto', 'selfiePhoto', 'licensePhoto', 'vehiclePhoto', 'createdAt', 'updatedAt'];
    
    foreach ($columns as $column) {
        $checkColumn = $conn->query("SHOW COLUMNS FROM tbuser LIKE '$column'");
        if ($checkColumn->num_rows == 0) {
            if ($column === 'status') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
            } elseif ($column === 'icNumber') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN icNumber VARCHAR(20)");
            } elseif ($column === 'licenseNumber') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN licenseNumber VARCHAR(50)");
            } elseif ($column === 'vehicleType') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN vehicleType VARCHAR(50)");
            } elseif ($column === 'vehicleNumber') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN vehicleNumber VARCHAR(20)");
            } elseif ($column === 'address') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN address TEXT");
            } elseif ($column === 'emergencyContact') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN emergencyContact VARCHAR(100)");
            } elseif ($column === 'emergencyPhone') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN emergencyPhone VARCHAR(20)");
            } elseif ($column === 'experience') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN experience VARCHAR(20)");
            } elseif ($column === 'languages') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN languages TEXT");
            } elseif ($column === 'availability') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN availability VARCHAR(50)");
            } elseif ($column === 'icPhoto') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN icPhoto VARCHAR(255)");
            } elseif ($column === 'selfiePhoto') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN selfiePhoto VARCHAR(255)");
            } elseif ($column === 'licensePhoto') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN licensePhoto VARCHAR(255)");
            } elseif ($column === 'vehiclePhoto') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN vehiclePhoto VARCHAR(255)");
            } elseif ($column === 'createdAt') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            } elseif ($column === 'updatedAt') {
                $conn->query("ALTER TABLE tbuser ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            }
        }
    }
    
    // Insert driver with all additional fields
    $stmt = $conn->prepare("INSERT INTO tbuser (name, userType, phone, email, password, status, icNumber, licenseNumber, vehicleType, vehicleNumber, address, emergencyContact, emergencyPhone, experience, languages, availability, icPhoto, selfiePhoto, licensePhoto, vehiclePhoto, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssssssssssssssssssss", $name, $userType, $phone, $email, $hashedPassword, $status, $icNumber, $licenseNumber, $vehicleType, $vehicleNumber, $address, $emergencyContact, $emergencyPhone, $experience, $languages, $availability, $icPhoto, $selfiePhoto, $licensePhoto, $vehiclePhoto);
} else {
    // Check if status column exists for regular users
    $checkStatus = $conn->query("SHOW COLUMNS FROM tbuser LIKE 'status'");
    if ($checkStatus->num_rows == 0) {
        $conn->query("ALTER TABLE tbuser ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
    }
    
    $checkCreatedAt = $conn->query("SHOW COLUMNS FROM tbuser LIKE 'createdAt'");
    if ($checkCreatedAt->num_rows == 0) {
        $conn->query("ALTER TABLE tbuser ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }
    
    // Insert regular user
    $stmt = $conn->prepare("INSERT INTO tbuser (name, userType, phone, email, password, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssssss", $name, $userType, $phone, $email, $hashedPassword, $status);
}

if ($stmt->execute()) {
    if ($userType === 'Driver') {
        echo json_encode(["status" => "success", "message" => "Driver registration submitted successfully! You will receive an email notification once JKM approves your application."]);
    } else {
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Failed to register user: " . $stmt->error]);
    error_log("Database error: " . $stmt->error);
}

$conn->close();

} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $e->getMessage()]);
    exit();
}
?>
