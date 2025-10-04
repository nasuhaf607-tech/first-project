-- OKU Transport System Database Schema
-- Enhanced version based on existing structure

USE dbuser;

-- Create users table if not exists (extend existing tbuser)
CREATE TABLE IF NOT EXISTS tbuser (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  userType ENUM('OKU User','Driver','Company Admin','JKM Officer') NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  
  -- Driver specific fields
  icNumber VARCHAR(20),
  licenseNumber VARCHAR(50),
  vehicleType VARCHAR(50),
  vehicleNumber VARCHAR(20),
  vehicleFeatures JSON DEFAULT NULL,
  address TEXT,
  emergencyContact VARCHAR(100),
  emergencyPhone VARCHAR(20),
  experience VARCHAR(20),
  languages TEXT,
  availability VARCHAR(50),
  
  -- Document uploads
  icPhoto VARCHAR(255),
  selfiePhoto VARCHAR(255),
  licensePhoto VARCHAR(255),
  vehiclePhoto VARCHAR(255),
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OKU accessibility profiles
CREATE TABLE IF NOT EXISTS tbaccessibilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  disability_type VARCHAR(150),
  mobility_aid ENUM('wheelchair', 'walker', 'crutches', 'none') DEFAULT 'none',
  preferred_vehicle VARCHAR(150),
  vehicle_features JSON DEFAULT NULL,
  special_requirements TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbuser(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Driver-OKU assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oku_id INT NOT NULL,
  driver_id INT NOT NULL,
  assigned_by INT NOT NULL,
  effective_from DATE,
  effective_to DATE,
  is_primary BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (oku_id) REFERENCES tbuser(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES tbuser(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES tbuser(id) ON DELETE SET NULL,
  UNIQUE KEY unique_assignment (oku_id, driver_id, effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bookings with collision detection
CREATE TABLE IF NOT EXISTS tbbook (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oku_id INT NOT NULL,
  driver_id INT NOT NULL,
  booking_type ENUM('daily','monthly') DEFAULT 'daily',
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  pickup_location VARCHAR(255),
  pickup_lat DECIMAL(10,8),
  pickup_lng DECIMAL(11,8),
  dropoff_location VARCHAR(255),
  dropoff_lat DECIMAL(10,8),
  dropoff_lng DECIMAL(11,8),
  purpose VARCHAR(255),
  special_instructions TEXT,
  status ENUM('pending','approved','in_progress','completed','cancelled','rejected') DEFAULT 'pending',
  estimated_duration INT, -- in minutes
  actual_start_time DATETIME,
  actual_end_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (oku_id) REFERENCES tbuser(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES tbuser(id) ON DELETE CASCADE,
  INDEX idx_driver_time (driver_id, start_datetime, end_datetime),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GPS tracking for live location
CREATE TABLE IF NOT EXISTS gps_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  booking_id INT DEFAULT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  speed DECIMAL(6,2) DEFAULT NULL,
  heading DECIMAL(6,2) DEFAULT NULL,
  accuracy DECIMAL(8,2) DEFAULT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES tbuser(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES tbbook(id) ON DELETE SET NULL,
  INDEX idx_driver_time (driver_id, timestamp),
  INDEX idx_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Driver ratings and feedback
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  oku_id INT DEFAULT NULL,
  booking_id INT DEFAULT NULL,
  rated_by INT NOT NULL, -- JKM officer or OKU user
  rating_value TINYINT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
  punctuality TINYINT DEFAULT NULL CHECK (punctuality >= 1 AND punctuality <= 5),
  helpfulness TINYINT DEFAULT NULL CHECK (helpfulness >= 1 AND helpfulness <= 5),
  vehicle_condition TINYINT DEFAULT NULL CHECK (vehicle_condition >= 1 AND vehicle_condition <= 5),
  overall_experience TINYINT DEFAULT NULL CHECK (overall_experience >= 1 AND overall_experience <= 5),
  comment TEXT,
  feedback_type ENUM('monthly', 'trip', 'complaint') DEFAULT 'trip',
  period_month DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES tbuser(id) ON DELETE CASCADE,
  FOREIGN KEY (oku_id) REFERENCES tbuser(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES tbbook(id) ON DELETE SET NULL,
  FOREIGN KEY (rated_by) REFERENCES tbuser(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'assignment', 'approval', 'rating', 'system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES tbuser(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('booking_advance_hours', '24', 'Minimum hours in advance for booking'),
('max_daily_bookings', '3', 'Maximum bookings per driver per day'),
('default_booking_duration', '120', 'Default booking duration in minutes'),
('gps_update_interval', '10', 'GPS update interval in seconds'),
('rating_required_monthly', 'true', 'Require monthly ratings from JKM')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);