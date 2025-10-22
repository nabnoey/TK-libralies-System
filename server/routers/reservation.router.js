const express = require('express')
const router = express.Router()
const {
    createReservation,
    getUserReservations,
    getAllReservations,
    getReservationById,
    cancelReservation,
    updateReservationStatus,
    checkInReservation,
    getAvailableTimeSlots,
    getKaraokeRoomsWithStatus,
    getMovieSeatsWithStatus,
    getRoomSeatDetails
} = require('../controllers/reservation.controller')

// Import authentication middleware
const requireAuth = require('../middlewares/requireAuth')

// Middleware สำหรับตรวจสอบว่าเป็น admin
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'ไม่มีสิทธิ์เข้าถึง'
        })
    }
    next()
}

// Routes สำหรับ user ทั่วไป
router.post('/', requireAuth, createReservation)
router.get('/my-reservations', requireAuth, getUserReservations)
router.get('/available-slots', getAvailableTimeSlots)

// Routes สำหรับดูห้อง/ที่นั่งพร้อมสถานะการจอง (ไม่ต้อง login)
router.get('/karaoke-rooms', getKaraokeRoomsWithStatus)
router.get('/movie-seats', getMovieSeatsWithStatus)
router.get('/room-details', getRoomSeatDetails)

// Routes สำหรับ admin
// มันชน path ของ /:id
router.get('/all', requireAuth, isAdmin, getAllReservations)

// Routes สำหรับ user ทั่วไป
router.get('/:id', requireAuth, getReservationById)
router.patch('/:id/cancel', requireAuth, cancelReservation)
router.patch('/:id/checkin', requireAuth, checkInReservation)

// Routes สำหรับ admin
router.patch('/:id/status', requireAuth, isAdmin, updateReservationStatus)

module.exports = router
