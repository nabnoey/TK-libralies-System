const { create } = require('../controllers/movieSeat.controller')

const express = require('express')
const router = express.Router()

router.post('/', create)

module.exports = router