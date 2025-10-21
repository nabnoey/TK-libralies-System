const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 5000


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('TK-libralies-System')
})

const movieSeatRouter = require('./routers/movieSeat.router')
const karaokeRoomRouter = require('./routers/karaokeRoom.router')

app.use('/api/v1/movie-seat', movieSeatRouter)
app.use('/api/v1/karaoke-room', karaokeRoomRouter)


app.listen(5000, () => console.log(`Server is running on http://localhost:${PORT}`))