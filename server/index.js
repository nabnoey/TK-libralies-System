const express = require('express')
require('dotenv').config()
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 5000



app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const sequelize = require('./models/db'); // ที่คุณ authenticate ไว้

// Import models before sync
require('./models/user.model');
require('./models/movieSeat.model');
require('./models/karaokeRoom.model');
require('./models/reservation.model');
require('./models/associations');

sequelize.sync({ alter: true })
  .then(() => console.log('DB synced'))
  .catch(err => console.error('DB sync error:', err));


app.get('/', (req, res) => {
    res.send('TK-libralies-System')
})

const authRoutes = require("./routers/auth.router");
const movieSeatRouter = require('./routers/movieSeat.router')
const karaokeRoomRouter = require('./routers/karaokeRoom.router')
const reservationRouter = require('./routers/reservation.router')
const requireAuth = require("./middlewares/requireAuth");
const User = require("./models/user.model");

// routers
app.use('/api/v1/movie-seat', movieSeatRouter)
app.use('/api/v1/karaoke-room', karaokeRoomRouter)
app.use('/api/v1/reservations', reservationRouter)
app.use("/auth", authRoutes);

// Protected route - Get current user
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


app.listen(5000, () => console.log(`Server is running on http://localhost:${PORT}`))