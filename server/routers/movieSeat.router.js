const { create, getAll, getById, update, deleteById } = require('../controllers/movieSeat.controller')

const express = require('express')
const router = express.Router()

router.post('/', create)
router.get('/', getAll)
router.get('/:id', getById)
router.put('/:id', update)
router.delete('/:id', deleteById)



module.exports = router