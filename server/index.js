const express = require('express')
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี (สำคัญสำหรับ production)
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('Created uploads directory')
}

// CORS configuration
app.use(
  cors({
    // origin ต้นทางมาจากไหนได้บ้าง
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", FRONTEND_URL],
    // อนุญาตให้ ใช้ method ไรบ้าง
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
    credentials: true // สำคัญสำหรับการส่ง cookies/auth headers
  })
);

// เพิ่มขนาด limit สำหรับรองรับรูปภาพ base64 (10MB)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files - ให้บริการไฟล์รูปภาพที่อัปโหลด
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const sequelize = require('./models/db'); 

// Import models before sync
require('./models/user.model');
require('./models/movieSeat.model');
require('./models/karaokeRoom.model');
require('./models/reservation.model');
require('./models/notification.model');
require('./models/associations');

// เริ่ม server ก่อน sync database เพื่อให้ health check ผ่าน
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)

  // Sync database หลังจาก server start แล้ว
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('DB synced')

      // เริ่มต้น Reservation Scheduler (ตรวจสอบเวลาใช้งาน)
      const { startReservationScheduler } = require('./services/reservationScheduler')
      startReservationScheduler()
    })
    .catch(err => {
      console.error('DB sync error:', err)
      // ไม่ปิด server แม้ DB sync fail เพื่อให้ health check ยังผ่าน
    })
});


app.get('/', (req, res) => {
    res.send('TK-libralies-System')
})

// Health check endpoint สำหรับ Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const authRoutes = require("./routers/auth.router");
const movieSeatRouter = require('./routers/movieSeat.router')
const karaokeRoomRouter = require('./routers/karaokeRoom.router')
const reservationRouter = require('./routers/reservation.router')
const notificationRouter = require('./routers/notification.router')
const requireAuth = require("./middlewares/requireAuth");
const User = require("./models/user.model");

// routers
app.use('/api/v1/movie-seat', movieSeatRouter)
app.use('/api/v1/karaoke-room', karaokeRoomRouter)
app.use('/api/v1/reservations', reservationRouter)
app.use('/api/v1/notifications', notificationRouter)
app.use("/auth", authRoutes);

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.uid, {
      attributes: { exclude: ["providerId"] }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DEV ONLY - Test login endpoint (ลบออกตอน production)
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./config/env");

/**
 * @swagger
 * /dev/test-login:
 *   post:
 *     summary: Test login endpoint (Development only)
 *     tags: [Development]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 default: test@example.com
 *               name:
 *                 type: string
 *                 default: Test User
 *     responses:
 *       200:
 *         description: Test login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
app.post("/dev/test-login", async (req, res) => {
  try {
    const { email, name } = req.body;

    // หา user หรือสร้างใหม่
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        email: email || "test@example.com",
        name: name || "Test User",
        provider: "dev-test",
        role: "user"
      });
    }

    // สร้าง token
    const token = jwt.sign(
      { uid: user.userId, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Test login failed" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB'
    });
  }

  // Multer file type error
  if (err.message && err.message.includes('รองรับเฉพาะไฟล์รูปภาพ')) {
    return res.status(400).json({
      message: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'ไม่พบเส้นทางที่ร้องขอ',
    path: req.path
  });
});