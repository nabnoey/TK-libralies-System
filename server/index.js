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

sequelize.sync({ alter: true })
  .then(() => console.log('DB synced'))
  .catch(err => console.error('DB sync error:', err));


app.get('/', (req, res) => {
    res.send('TK-libralies-System')
})

const authRoutes = require("./routers/auth.router");
const movieSeatRouter = require('./routers/movieSeat.router')
const karaokeRoomRouter = require('./routers/karaokeRoom.router')
const requireAuth = require("./middlewares/requireAuth");
const User = require("./models/user.model");

// routers
app.use('/api/v1/movie-seat', movieSeatRouter)
app.use('/api/v1/karaoke-room', karaokeRoomRouter)
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


app.listen(5000, () => console.log(`Server is running on http://localhost:${PORT}`))