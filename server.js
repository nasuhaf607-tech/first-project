// OKU Transport System - Node.js Express Server with Socket.IO
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json());

// Serve React build files
app.use(express.static('build'));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'dbuser'
};

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'oku-transport-secret-2024';

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Database connection
async function getDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ===== API ROUTES =====

// User Authentication
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM tbuser WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check driver approval status
    if (user.userType === 'Driver' && user.status !== 'approved') {
      const statusMessages = {
        'pending': 'Your driver application is pending approval',
        'rejected': 'Your driver application has been rejected'
      };
      return res.status(403).json({ 
        message: statusMessages[user.status] || 'Account not active' 
      });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userType,
        status: user.status
      }
    });
    
    await connection.end();
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, phone, password, userType } = req.body;
    
    if (!name || !email || !phone || !password || !userType) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const connection = await getDbConnection();
    
    // Check if email exists
    const [existing] = await connection.execute(
      'SELECT id FROM tbuser WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = userType === 'Driver' ? 'pending' : 'active';
    
    const [result] = await connection.execute(
      'INSERT INTO tbuser (name, email, phone, password, userType, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, userType, status]
    );
    
    res.json({
      message: userType === 'Driver' 
        ? 'Driver registration submitted. Awaiting approval.' 
        : 'Registration successful',
      userId: result.insertId
    });
    
    await connection.end();
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM tbuser WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = rows[0];
    delete user.password; // Don't send password
    
    res.json({ user });
    await connection.end();
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ASSIGNMENT ROUTES =====

// Get assignments for current user
app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const connection = await getDbConnection();
    let query, params;
    
    if (req.user.role === 'Driver') {
      query = `
        SELECT a.*, u.name as oku_name, u.email as oku_email, u.phone as oku_phone,
               acc.disability_type, acc.mobility_aid, acc.special_requirements
        FROM assignments a
        JOIN tbuser u ON a.oku_id = u.id
        LEFT JOIN tbaccessibilities acc ON a.oku_id = acc.user_id
        WHERE a.driver_id = ? AND a.status = 'active'
      `;
      params = [req.user.id];
    } else if (req.user.role === 'OKU User') {
      query = `
        SELECT a.*, u.name as driver_name, u.email as driver_email, u.phone as driver_phone,
               u.vehicleType, u.vehicleNumber, u.status as driver_status
        FROM assignments a
        JOIN tbuser u ON a.driver_id = u.id
        WHERE a.oku_id = ? AND a.status = 'active'
      `;
      params = [req.user.id];
    } else {
      // Admin/JKM can see all assignments
      query = `
        SELECT a.*, 
               oku.name as oku_name, oku.email as oku_email,
               driver.name as driver_name, driver.email as driver_email,
               driver.vehicleType, driver.vehicleNumber
        FROM assignments a
        JOIN tbuser oku ON a.oku_id = oku.id
        JOIN tbuser driver ON a.driver_id = driver.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
      `;
      params = [];
    }
    
    const [rows] = await connection.execute(query, params);
    res.json({ assignments: rows });
    
    await connection.end();
  } catch (error) {
    console.error('Assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create assignment (Admin/JKM only)
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    if (!['Company Admin', 'JKM Officer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const { oku_id, driver_id, effective_from, effective_to, notes } = req.body;
    const connection = await getDbConnection();
    
    // Verify OKU and Driver exist and have correct roles
    const [users] = await connection.execute(
      'SELECT id, userType, status FROM tbuser WHERE id IN (?, ?)',
      [oku_id, driver_id]
    );
    
    if (users.length !== 2) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }
    
    const oku = users.find(u => u.id === parseInt(oku_id));
    const driver = users.find(u => u.id === parseInt(driver_id));
    
    if (oku?.userType !== 'OKU User' || driver?.userType !== 'Driver') {
      return res.status(400).json({ message: 'Invalid user roles' });
    }
    
    if (driver?.status !== 'approved') {
      return res.status(400).json({ message: 'Driver not approved' });
    }
    
    const [result] = await connection.execute(
      `INSERT INTO assignments (oku_id, driver_id, assigned_by, effective_from, effective_to, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [oku_id, driver_id, req.user.id, effective_from, effective_to, notes]
    );
    
    res.json({
      message: 'Assignment created successfully',
      assignmentId: result.insertId
    });
    
    await connection.end();
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== BOOKING ROUTES =====

// Get driver schedule (for OKU users to see availability)
app.get('/api/driver/:driverId/schedule', authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params;
    const { date } = req.query; // Optional date filter
    
    const connection = await getDbConnection();
    
    let query = `
      SELECT b.id, b.start_datetime, b.end_datetime, b.status, b.pickup_location, b.dropoff_location,
             u.name as oku_name
      FROM tbbook b
      JOIN tbuser u ON b.oku_id = u.id
      WHERE b.driver_id = ? AND b.status IN ('pending', 'approved', 'in_progress')
    `;
    
    const params = [driverId];
    
    if (date) {
      query += ' AND DATE(b.start_datetime) = ?';
      params.push(date);
    } else {
      query += ' AND DATE(b.start_datetime) >= CURDATE()';
    }
    
    query += ' ORDER BY b.start_datetime ASC';
    
    const [rows] = await connection.execute(query, params);
    res.json({ schedule: rows });
    
    await connection.end();
  } catch (error) {
    console.error('Driver schedule error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const connection = await getDbConnection();
    let query, params;
    
    if (req.user.role === 'Driver') {
      query = `
        SELECT b.*, u.name as oku_name, u.phone as oku_phone,
               acc.disability_type, acc.mobility_aid, acc.special_requirements
        FROM tbbook b
        JOIN tbuser u ON b.oku_id = u.id
        LEFT JOIN tbaccessibilities acc ON b.oku_id = acc.user_id
        WHERE b.driver_id = ?
        ORDER BY b.start_datetime DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'OKU User') {
      query = `
        SELECT b.*, u.name as driver_name, u.phone as driver_phone, 
               u.vehicleType, u.vehicleNumber, u.vehicleFeatures, u.status as driver_status
        FROM tbbook b
        JOIN tbuser u ON b.driver_id = u.id
        WHERE b.oku_id = ?
        ORDER BY b.start_datetime DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT b.*, 
               oku.name as oku_name, oku.phone as oku_phone,
               driver.name as driver_name, driver.phone as driver_phone,
               driver.vehicleType, driver.vehicleNumber, driver.vehicleFeatures
        FROM tbbook b
        JOIN tbuser oku ON b.oku_id = oku.id
        JOIN tbuser driver ON b.driver_id = driver.id
        ORDER BY b.start_datetime DESC
      `;
      params = [];
    }
    
    const [rows] = await connection.execute(query, params);
    res.json({ bookings: rows });
    
    await connection.end();
  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create booking with collision detection
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { 
      driver_id, booking_type, start_datetime, end_datetime, 
      pickup_location, pickup_lat, pickup_lng,
      dropoff_location, dropoff_lat, dropoff_lng,
      purpose, special_instructions 
    } = req.body;
    
    const connection = await getDbConnection();
    
    // Check if assignment exists
    const [assignments] = await connection.execute(
      'SELECT id FROM assignments WHERE oku_id = ? AND driver_id = ? AND status = "active"',
      [req.user.id, driver_id]
    );
    
    if (assignments.length === 0) {
      return res.status(400).json({ message: 'No assignment exists with this driver' });
    }
    
    // Check driver status
    const [drivers] = await connection.execute(
      'SELECT status FROM tbuser WHERE id = ? AND userType = "Driver"',
      [driver_id]
    );
    
    if (drivers.length === 0 || drivers[0].status !== 'approved') {
      return res.status(400).json({ message: 'Driver not available' });
    }
    
    // Check for booking conflicts
    const [conflicts] = await connection.execute(
      `SELECT id FROM tbbook 
       WHERE driver_id = ? 
         AND status IN ('pending', 'approved', 'in_progress')
         AND NOT (? <= start_datetime OR ? >= end_datetime)`,
      [driver_id, end_datetime, start_datetime]
    );
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Driver already booked at that date/time. Please choose another slot.' 
      });
    }
    
    const [result] = await connection.execute(
      `INSERT INTO tbbook (
        oku_id, driver_id, booking_type, start_datetime, end_datetime,
        pickup_location, pickup_lat, pickup_lng, 
        dropoff_location, dropoff_lat, dropoff_lng,
        purpose, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, driver_id, booking_type, start_datetime, end_datetime,
        pickup_location, pickup_lat, pickup_lng,
        dropoff_location, dropoff_lat, dropoff_lng,
        purpose, special_instructions
      ]
    );
    
    // Emit real-time notification to driver
    io.to(`driver_${driver_id}`).emit('new_booking', {
      bookingId: result.insertId,
      message: 'New booking request received'
    });
    
    res.json({
      message: 'Booking created successfully',
      bookingId: result.insertId
    });
    
    await connection.end();
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;
    const connection = await getDbConnection();
    
    let query, params;
    
    if (req.user.role === 'Driver') {
      query = 'UPDATE tbbook SET status = ?, updated_at = NOW() WHERE id = ? AND driver_id = ?';
      params = [status, bookingId, req.user.id];
    } else if (['Company Admin', 'JKM Officer'].includes(req.user.role)) {
      query = 'UPDATE tbbook SET status = ?, updated_at = NOW() WHERE id = ?';
      params = [status, bookingId];
    } else {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const [result] = await connection.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Get booking details for real-time notification
    const [booking] = await connection.execute(
      'SELECT oku_id, driver_id FROM bookings WHERE id = ?',
      [bookingId]
    );
    
    if (booking.length > 0) {
      io.to(`oku_${booking[0].oku_id}`).emit('booking_update', {
        bookingId,
        status,
        message: `Booking ${status}`
      });
    }
    
    res.json({ message: 'Booking status updated successfully' });
    await connection.end();
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== USER MANAGEMENT ROUTES =====

// Get users by type and status (for admin)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (!['Company Admin', 'JKM Officer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const { type, status } = req.query;
    const connection = await getDbConnection();
    
    let query = 'SELECT * FROM tbuser WHERE 1=1';
    const params = [];
    
    if (type === 'oku') {
      query += ' AND userType = ?';
      params.push('OKU User');
    } else if (type === 'driver') {
      query += ' AND userType = ?';
      params.push('Driver');
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const [rows] = await connection.execute(query, params);
    
    // Remove password from results
    const users = rows.map(user => {
      delete user.password;
      return user;
    });
    
    res.json({ users });
    await connection.end();
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update driver profile (with file upload)
app.put('/api/driver/profile', authenticateToken, upload.fields([
  { name: 'licensePhoto', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 },
  { name: 'icPhoto', maxCount: 1 },
  { name: 'selfiePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({ message: 'Only drivers can update driver profile' });
    }

    const {
      licenseNumber, vehicleType, vehicleNumber, vehicleFeatures,
      experience, languages, emergencyContact, emergencyPhone, address
    } = req.body;

    const connection = await getDbConnection();

    // Parse vehicle features if it's a string
    let parsedFeatures;
    try {
      parsedFeatures = typeof vehicleFeatures === 'string' 
        ? JSON.parse(vehicleFeatures) 
        : vehicleFeatures;
    } catch (e) {
      parsedFeatures = vehicleFeatures;
    }

    // Handle file uploads
    const documents = {};
    if (req.files) {
      if (req.files.licensePhoto) documents.licensePhoto = req.files.licensePhoto[0].filename;
      if (req.files.vehiclePhoto) documents.vehiclePhoto = req.files.vehiclePhoto[0].filename;
      if (req.files.icPhoto) documents.icPhoto = req.files.icPhoto[0].filename;
      if (req.files.selfiePhoto) documents.selfiePhoto = req.files.selfiePhoto[0].filename;
    }

    // Update driver profile and set status to pending for admin approval
    const [result] = await connection.execute(
      `UPDATE tbuser SET 
         licenseNumber = ?, vehicleType = ?, vehicleNumber = ?, vehicleFeatures = ?,
         experience = ?, languages = ?, emergencyContact = ?, emergencyPhone = ?, 
         address = ?, licensePhoto = ?, vehiclePhoto = ?, icPhoto = ?, selfiePhoto = ?,
         status = 'pending', updatedAt = NOW()
       WHERE id = ? AND userType = 'Driver'`,
      [
        licenseNumber, vehicleType, vehicleNumber, JSON.stringify(parsedFeatures),
        experience, languages, emergencyContact, emergencyPhone, address,
        documents.licensePhoto || null, documents.vehiclePhoto || null,
        documents.icPhoto || null, documents.selfiePhoto || null,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ 
      message: 'Profile updated successfully! Waiting for admin approval to start receiving bookings.',
      status: 'pending'
    });
    await connection.end();
  } catch (error) {
    console.error('Driver profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get driver profile completion status
app.get('/api/driver/profile/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({ message: 'Only drivers can check profile status' });
    }

    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      `SELECT licenseNumber, vehicleType, vehicleNumber, status, 
              licensePhoto, vehiclePhoto, icPhoto, selfiePhoto
       FROM tbuser WHERE id = ? AND userType = 'Driver'`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const driver = rows[0];
    const isProfileComplete = driver.licenseNumber && driver.vehicleType && 
                             driver.vehicleNumber && driver.licensePhoto &&
                             driver.vehiclePhoto && driver.icPhoto && driver.selfiePhoto;

    res.json({
      isComplete: isProfileComplete,
      status: driver.status,
      needsApproval: driver.status === 'pending',
      canAcceptBookings: driver.status === 'approved' && isProfileComplete
    });

    await connection.end();
  } catch (error) {
    console.error('Driver profile status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update driver status (approve/reject) - ADMIN ONLY
app.put('/api/drivers/:id/status', authenticateToken, async (req, res) => {
  try {
    if (!['Company Admin', 'JKM Officer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const { status } = req.body;
    const driverId = req.params.id;
    const connection = await getDbConnection();
    
    const [result] = await connection.execute(
      'UPDATE tbuser SET status = ? WHERE id = ? AND userType = "Driver"',
      [status, driverId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json({ message: `Driver ${status} successfully` });
    await connection.end();
  } catch (error) {
    console.error('Driver status update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== GPS TRACKING ROUTES =====

// Update GPS location
app.post('/api/gps/update', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({ message: 'Only drivers can update GPS' });
    }
    
    const { lat, lng, speed, heading, accuracy, booking_id } = req.body;
    const connection = await getDbConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO gps_tracking (driver_id, lat, lng, speed, heading, accuracy, booking_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, lat, lng, speed, heading, accuracy, booking_id]
    );
    
    // Get driver details for real-time update
    const [driverRows] = await connection.execute(
      'SELECT name, vehicleType, vehicleNumber FROM tbuser WHERE id = ?',
      [req.user.id]
    );
    
    // Emit real-time location to connected users
    const locationData = {
      driver_id: req.user.id,
      lat,
      lng,
      speed,
      heading,
      accuracy,
      timestamp: new Date(),
      booking_id,
      driver_name: driverRows[0]?.name,
      vehicleType: driverRows[0]?.vehicleType,
      vehicleNumber: driverRows[0]?.vehicleNumber
    };
    
    io.emit('gps_update', locationData);
    
    res.json({ message: 'GPS location updated successfully' });
    await connection.end();
  } catch (error) {
    console.error('GPS update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get latest GPS locations
app.get('/api/gps/latest', authenticateToken, async (req, res) => {
  try {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      `SELECT g.*, u.name as driver_name, u.vehicleType, u.vehicleNumber 
       FROM gps_tracking g
       JOIN tbuser u ON g.driver_id = u.id
       WHERE g.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY g.timestamp DESC
       LIMIT 100`
    );
    
    res.json({ locations: rows });
    await connection.end();
  } catch (error) {
    console.error('GPS locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== SOCKET.IO FOR REAL-TIME FEATURES =====

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room based on user role and ID
  socket.on('join_room', (userData) => {
    const room = `${userData.role.toLowerCase().replace(' ', '_')}_${userData.id}`;
    socket.join(room);
    console.log(`User ${userData.id} joined room: ${room}`);
  });
  
  // Handle real-time GPS updates
  socket.on('gps_location', (data) => {
    socket.broadcast.emit('gps_update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app for specific routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/bookings', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/authtest', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/simplelogin', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/simpledash', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/driver-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/driver-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/enhanced-bookings', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`OKU Transport Server running on port ${PORT}`);
  console.log(`Frontend served from /build directory`);
  console.log(`Socket.IO enabled for real-time features`);
});

module.exports = app;