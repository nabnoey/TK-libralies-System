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
    getRoomSeatDetails,
    getKaraokeRoomQueue,
    getMovieSeatQueue
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

// ========================================
// สร้างการจอง (USER - ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations:
 *   post:
 *     summary: Create a new reservation (Queue system for both Karaoke and Movie)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationType
 *               - itemId
 *               - friendEmails
 *             properties:
 *               reservationType:
 *                 type: string
 *                 enum: [karaoke, movie]
 *                 description: Type of reservation
 *               itemId:
 *                 type: integer
 *                 description: ID of karaoke room or movie seat
 *               friendEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 minItems: 3
 *                 maxItems: 5
 *                 description: Array of friend emails (must be registered users, need 3-5 friends. Total people = friends + you = 4-6)
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 description: Date of reservation (YYYY-MM-DD) - defaults to today if not specified
 *           examples:
 *             karaoke:
 *               summary: Karaoke reservation (5 people total = 4 friends + you)
 *               value:
 *                 reservationType: karaoke
 *                 itemId: 1
 *                 friendEmails: ["friend1@example.com", "friend2@example.com", "friend3@example.com", "friend4@example.com"]
 *                 reservationDate: "2025-10-23"
 *             movie:
 *               summary: Movie seat reservation (4 people total = 3 friends + you)
 *               value:
 *                 reservationType: movie
 *                 itemId: 1
 *                 friendEmails: ["friend1@example.com", "friend2@example.com", "friend3@example.com"]
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "จองสำเร็จ! คุณอยู่คิวที่ 1 รอ admin อนุมัติ"
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Reservation'
 *                     - type: object
 *                       properties:
 *                         queuePosition:
 *                           type: integer
 *                           description: Your position in the queue
 *                         peopleAhead:
 *                           type: integer
 *                           description: Number of people ahead of you
 *       400:
 *         description: Validation error or booking closed (after 15:00 for karaoke, 14:00 for movie)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', requireAuth, createReservation)

// ========================================
// ดูการจองของตัวเอง (USER - ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/my-reservations:
 *   get:
 *     summary: Get current user's reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my-reservations', requireAuth, getUserReservations)

// ========================================
// ดูช่วงเวลาว่าง (PUBLIC - ไม่ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/available-slots:
 *   get:
 *     summary: Get available time slots
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [movie-seat, karaoke-room]
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of available time slots
 *       500:
 *         description: Server error
 */
router.get('/available-slots', getAvailableTimeSlots)

// ========================================
// ดูห้องคาราโอเกะทั้งหมดพร้อมสถานะ (PUBLIC - ไม่ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/karaoke-rooms:
 *   get:
 *     summary: Get all karaoke rooms with reservation status and queue
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of karaoke rooms with status and queue
 *       500:
 *         description: Server error
 */
router.get('/karaoke-rooms', getKaraokeRoomsWithStatus)

// ========================================
// ดูคิวห้องคาราโอเกะ (PUBLIC - ไม่ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/karaoke-queue:
 *   get:
 *     summary: Get queue for a specific karaoke room
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Karaoke room ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Queue information for the room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.get('/karaoke-queue', getKaraokeRoomQueue)

// ========================================
// ดูที่นั่งหนังทั้งหมดพร้อมสถานะ (PUBLIC - ไม่ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/movie-seats:
 *   get:
 *     summary: Get all movie seats with reservation status and queue
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of movie seats with status and queue
 *       500:
 *         description: Server error
 */
router.get('/movie-seats', getMovieSeatsWithStatus)

// ========================================
// ดูคิวที่นั่งหนัง (PUBLIC - ไม่ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/movie-queue:
 *   get:
 *     summary: Get queue for a specific movie seat
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie seat ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Queue information for the seat
 *       404:
 *         description: Seat not found
 *       500:
 *         description: Server error
 */
router.get('/movie-queue', getMovieSeatQueue)

// ========================================
// ดูรายละเอียดห้อง/ที่นั่ง (PUBLIC - ไม่ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/room-details:
 *   get:
 *     summary: Get room/seat details with reservation information
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [movie-seat, karaoke-room]
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room/seat details
 *       500:
 *         description: Server error
 */
router.get('/room-details', getRoomSeatDetails)

// ========================================
// ดูการจองทั้งหมด (ADMIN ONLY)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/all:
 *   get:
 *     summary: Get all reservations (Admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.get('/all', requireAuth, isAdmin, getAllReservations)

// ========================================
// ดูการจองตาม ID (USER - ต้อง login)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', requireAuth, getReservationById)

// ========================================
// ยกเลิกการจอง (USER - ต้อง login, เจ้าของการจองเท่านั้น)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/cancel', requireAuth, cancelReservation)

// ========================================
// เช็คอินการจอง (USER - ต้อง login, เจ้าของการจองเท่านั้น)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/{id}/checkin:
 *   patch:
 *     summary: Check-in to a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-in successful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/checkin', requireAuth, checkInReservation)

// ========================================
// อัพเดทสถานะการจอง (ADMIN ONLY)
// ========================================
/**
 * @swagger
 * /api/v1/reservations/{id}/status:
 *   patch:
 *     summary: Update reservation status (Admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', requireAuth, isAdmin, updateReservationStatus)

module.exports = router
