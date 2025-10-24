const { create, getAll, getById, update, deleteById } = require('../controllers/movieSeat.controller')

const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload.middleware')

/**
 * @swagger
 * /api/v1/movie-seat:
 *   post:
 *     summary: Create a new movie seat
 *     tags: [Movie Seats]
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
 *                 example: Movie Theater A
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพโรงหนัง (jpeg, jpg, png, gif, webp) ไม่เกิน 5MB
 *               status:
 *                 type: boolean
 *                 default: true
 *                 description: true = available, false = occupied
 *     responses:
 *       201:
 *         description: Seat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieSeat'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('image'), create)

/**
 * @swagger
 * /api/v1/movie-seat:
 *   get:
 *     summary: Get all movie seats
 *     tags: [Movie Seats]
 *     responses:
 *       200:
 *         description: List of all movie seats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MovieSeat'
 *       500:
 *         description: Server error
 */
router.get('/', getAll)

/**
 * @swagger
 * /api/v1/movie-seat/{id}:
 *   get:
 *     summary: Get a movie seat by ID
 *     tags: [Movie Seats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seat ID
 *     responses:
 *       200:
 *         description: Seat details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieSeat'
 *       404:
 *         description: Seat not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getById)

/**
 * @swagger
 * /api/v1/movie-seat/{id}:
 *   put:
 *     summary: Update a movie seat
 *     tags: [Movie Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seat ID
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
 *                 description: รูปภาพโรงหนัง (jpeg, jpg, png, gif, webp) ไม่เกิน 5MB
 *               status:
 *                 type: boolean
 *                 description: true = available, false = occupied
 *     responses:
 *       200:
 *         description: Seat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieSeat'
 *       404:
 *         description: Seat not found
 *       500:
 *         description: Server error
 */
router.put('/:id', upload.single('image'), update)

/**
 * @swagger
 * /api/v1/movie-seat/{id}:
 *   delete:
 *     summary: Delete a movie seat
 *     tags: [Movie Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seat ID
 *     responses:
 *       200:
 *         description: Seat deleted successfully
 *       404:
 *         description: Seat not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteById)

module.exports = router