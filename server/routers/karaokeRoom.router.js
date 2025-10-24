const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload.middleware')

const { create, getAll, getById, update, deleteById } = require('../controllers/karaokeRoom.controller')

/**
 * @swagger
 * /api/v1/karaoke-room:
 *   post:
 *     summary: Create a new karaoke room
 *     tags: [Karaoke Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: Karaoke Room VIP
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพห้องคาราโอเกะ (jpeg, jpg, png, gif, webp) ไม่เกิน 5MB
 *               status:
 *                 type: boolean
 *                 default: true
 *                 description: true = available, false = occupied
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KaraokeRoom'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('image'), create)

/**
 * @swagger
 * /api/v1/karaoke-room:
 *   get:
 *     summary: Get all karaoke rooms
 *     tags: [Karaoke Rooms]
 *     responses:
 *       200:
 *         description: List of all karaoke rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KaraokeRoom'
 *       500:
 *         description: Server error
 */
router.get('/', getAll)

/**
 * @swagger
 * /api/v1/karaoke-room/{id}:
 *   get:
 *     summary: Get a karaoke room by ID
 *     tags: [Karaoke Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KaraokeRoom'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getById)

/**
 * @swagger
 * /api/v1/karaoke-room/{id}:
 *   put:
 *     summary: Update a karaoke room
 *     tags: [Karaoke Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพห้องคาราโอเกะ (jpeg, jpg, png, gif, webp) ไม่เกิน 5MB
 *               status:
 *                 type: boolean
 *                 description: true = available, false = occupied
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KaraokeRoom'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.put('/:id', upload.single('image'), update)

/**
 * @swagger
 * /api/v1/karaoke-room/{id}:
 *   delete:
 *     summary: Delete a karaoke room
 *     tags: [Karaoke Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteById)

module.exports = router