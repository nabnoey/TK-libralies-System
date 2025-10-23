const { Reservation, User, KaraokeRoom, MovieSeat } = require('../models/associations')
const { Op } = require('sequelize')

// Helper: สร้าง time slots ทั้งหมดในช่วง 09:00-15:00 (เวลาเริ่มต้นที่จองได้)
const generateAllStartTimes = () => {
    const times = []
    for (let hour = 9; hour <= 15; hour++) {
        times.push(`${String(hour).padStart(2, '0')}:00`)
    }
    return times // ["09:00", "10:00", "11:00", ..., "15:00"]
}

// Helper: แปลง timeSlot (HH:MM-HH:MM) กลับเป็นเวลาเริ่มต้น (HH:MM)
const extractStartTime = (timeSlot) => {
    return timeSlot.split('-')[0]
}

// ตรวจสอบว่า user จองในวันนี้ไปแล้วหรือยัง
const checkUserDailyReservation = async (userId, reservationDate) => {
    const existingReservation = await Reservation.findOne({
        where: {
            userId,
            reservationDate,
            status: {
                [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
            }
        }
    })
    return existingReservation
}

// ตรวจสอบว่า room/seat ว่างในช่วงเวลานั้นหรือไม่
const checkItemAvailability = async (reservationType, itemId, reservationDate, timeSlot) => {
    const existingReservation = await Reservation.findOne({
        where: {
            reservationType,
            itemId,
            reservationDate,
            timeSlot,
            status: {
                [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
            }
        }
    })
    return !existingReservation // return true if available
}

// Helper: แปลงเวลาเริ่มต้น (HH:MM) เป็น timeSlot (HH:MM-HH:MM) โดยบวก 1 ชั่วโมง
const calculateTimeSlot = (startTime) => {
    // ตรวจสอบรูปแบบ HH:MM
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime)) {
        throw new Error('รูปแบบเวลาไม่ถูกต้อง ต้องเป็น "HH:MM" เช่น "09:30"')
    }

    const [hour, minute] = startTime.split(':').map(Number)

    // ตรวจสอบว่าเวลาเริ่มต้นอยู่ในช่วง 09:00-15:59
    if (hour < 9 || hour > 15) {
        throw new Error('เวลาเริ่มต้นต้องอยู่ในช่วง 09:00-15:59 เท่านั้น')
    }

    // ถ้าเลือก 15:00-15:59 จะจบที่ 16:00-16:59 ซึ่งเกินเวลาปิด
    if (hour === 15 && minute > 0) {
        throw new Error('เวลาเริ่มต้นหลังสุดคือ 15:00 เพื่อให้จบพอดี 16:00')
    }

    // คำนวณเวลาสิ้นสุด (บวก 1 ชั่วโมง)
    let endHour = hour + 1
    const endMinute = minute

    const startTimeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    const endTimeFormatted = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

    return `${startTimeFormatted}-${endTimeFormatted}`
}

// สร้างการจอง
const createReservation = async (req, res) => {
    try {
        const { reservationType, itemId, reservationDate, timeSlot: startTime } = req.body
        const userId = req.user.uid // จาก middleware authentication

        // ตรวจสอบว่ามีข้อมูลครบหรือไม่
        if (!reservationType || !itemId || !reservationDate || !startTime) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            })
        }

        // ตรวจสอบว่า reservationType ถูกต้องหรือไม่
        if (!['karaoke', 'movie'].includes(reservationType)) {
            return res.status(400).json({
                success: false,
                message: 'ประเภทการจองไม่ถูกต้อง'
            })
        }

        // แปลงเวลาเริ่มต้นเป็น timeSlot (เช่น "09:30" -> "09:30-10:30")
        let timeSlot
        try {
            timeSlot = calculateTimeSlot(startTime)
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        // ตรวจสอบว่า user จองในวันนี้ไปแล้วหรือยัง
        const existingReservation = await checkUserDailyReservation(userId, reservationDate)
        if (existingReservation) {
            return res.status(400).json({
                success: false,
                message: 'คุณได้จองคิวในวันนี้ไปแล้ว สามารถจองได้วันละ 1 รอบเท่านั้น'
            })
        }

        // ตรวจสอบว่า room/seat ที่ต้องการจองมีอยู่จริงหรือไม่
        if (reservationType === 'karaoke') {
            const karaokeRoom = await KaraokeRoom.findByPk(itemId)
            if (!karaokeRoom) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบห้องคาราโอเกะที่ระบุ'
                })
            }
        } else if (reservationType === 'movie') {
            const movieSeat = await MovieSeat.findByPk(itemId)
            if (!movieSeat) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบที่นั่งหนังที่ระบุ'
                })
            }
        }

        // ตรวจสอบว่า room/seat ว่างในช่วงเวลานั้นหรือไม่
        const isAvailable = await checkItemAvailability(reservationType, itemId, reservationDate, timeSlot)
        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกช่วงเวลาอื่น'
            })
        }

        // สร้างการจอง
        const reservation = await Reservation.create({
            userId,
            reservationType,
            itemId,
            reservationDate,
            timeSlot,
            status: 'pending'
        })

        return res.status(201).json({
            success: true,
            message: 'จองคิวสำเร็จ',
            data: reservation
        })
    } catch (error) {
        console.error('Error creating reservation:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการจอง'
        })
    }
}

// ดูการจองทั้งหมดของ user
const getUserReservations = async (req, res) => {
    try {
        const userId = req.user.uid

        const reservations = await Reservation.findAll({
            where: { userId },
            include: [
                {
                    model: KaraokeRoom,
                    as: 'karaokeRoom',
                    required: false
                },
                {
                    model: MovieSeat,
                    as: 'movieSeat',
                    required: false
                }
            ],
            order: [['reservationDate', 'DESC'], ['createdAt', 'DESC']]
        })

        // จัดรูปแบบ response ให้แสดงเฉพาะข้อมูลที่เกี่ยวข้อง
        const formattedReservations = reservations.map(r => {
            const reservation = r.toJSON()

            // ลบข้อมูลที่ไม่เกี่ยวข้อง
            if (reservation.reservationType === 'karaoke') {
                delete reservation.movieSeat
            } else if (reservation.reservationType === 'movie') {
                delete reservation.karaokeRoom
            }

            return reservation
        })

        return res.status(200).json({
            success: true,
            data: formattedReservations
        })
    } catch (error) {
        console.error('Error getting user reservations:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง'
        })
    }
}

// ดูการจองทั้งหมด (สำหรับ admin)
const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'name', 'email']
                },
                {
                    model: KaraokeRoom,
                    as: 'karaokeRoom',
                    required: false
                },
                {
                    model: MovieSeat,
                    as: 'movieSeat',
                    required: false
                }
            ],
            order: [['reservationDate', 'DESC'], ['createdAt', 'DESC']]
        })

        // จัดรูปแบบ response ให้แสดงเฉพาะข้อมูลที่เกี่ยวข้อง
        const formattedReservations = reservations.map(r => {
            const reservation = r.toJSON()

            // ลบข้อมูลที่ไม่เกี่ยวข้อง
            if (reservation.reservationType === 'karaoke') {
                delete reservation.movieSeat
            } else if (reservation.reservationType === 'movie') {
                delete reservation.karaokeRoom
            }

            return reservation
        })

        return res.status(200).json({
            success: true,
            data: formattedReservations
        })
    } catch (error) {
        console.error('Error getting all reservations:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง'
        })
    }
}

// ดูรายละเอียดการจอง
const getReservationById = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.uid

        const reservation = await Reservation.findOne({
            where: {
                reservationId: id,
                userId // ให้ดูได้เฉพาะการจองของตัวเอง
            },
            include: [
                {
                    model: KaraokeRoom,
                    as: 'karaokeRoom',
                    required: false
                },
                {
                    model: MovieSeat,
                    as: 'movieSeat',
                    required: false
                }
            ]
        })

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบการจองที่ระบุ'
            })
        }

        // จัดรูปแบบ response ให้แสดงเฉพาะข้อมูลที่เกี่ยวข้อง
        const formattedReservation = reservation.toJSON()

        // ลบข้อมูลที่ไม่เกี่ยวข้อง
        if (formattedReservation.reservationType === 'karaoke') {
            delete formattedReservation.movieSeat
        } else if (formattedReservation.reservationType === 'movie') {
            delete formattedReservation.karaokeRoom
        }

        return res.status(200).json({
            success: true,
            data: formattedReservation
        })
    } catch (error) {
        console.error('Error getting reservation:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง'
        })
    }
}

// ยกเลิกการจอง
const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.uid

        const reservation = await Reservation.findOne({
            where: {
                reservationId: id,
                userId
            }
        })

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบการจองที่ระบุ'
            })
        }

        if (reservation.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'การจองนี้ถูกยกเลิกไปแล้ว'
            })
        }

        if (reservation.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถยกเลิกการจองที่เสร็จสิ้นแล้ว'
            })
        }

        reservation.status = 'cancelled'
        await reservation.save()

        return res.status(200).json({
            success: true,
            message: 'ยกเลิกการจองสำเร็จ',
            data: reservation
        })
    } catch (error) {
        console.error('Error cancelling reservation:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการยกเลิกการจอง'
        })
    }
}

// อัพเดทสถานะการจอง (สำหรับ admin)
const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const validStatuses = ['pending', 'awaiting_checkin', 'confirmed', 'cancelled', 'completed']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'สถานะไม่ถูกต้อง'
            })
        }

        const reservation = await Reservation.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'name', 'email']
                }
            ]
        })

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบการจองที่ระบุ'
            })
        }

        // ถ้า admin เปลี่ยนจาก pending -> awaiting_checkin (approve)
        if (reservation.status === 'pending' && status === 'awaiting_checkin') {
            const now = new Date()
            const checkInDeadline = new Date(now.getTime() + 5 * 60 * 1000) // +5 นาที

            reservation.status = status
            reservation.approvedAt = now
            reservation.checkInDeadline = checkInDeadline
            await reservation.save()

            // TODO: ส่ง notification ไปหา user
            console.log(`[NOTIFICATION] ส่งการแจ้งเตือนไปยัง User ID: ${reservation.userId}`)
            console.log(`การจอง #${reservation.reservationId} ได้รับการอนุมัติแล้ว`)
            console.log(`กรุณา check-in ภายใน 5 นาที (ก่อน ${checkInDeadline.toLocaleString('th-TH')})`)
            console.log(`หากไม่ check-in ทันเวลา การจองจะถูกยกเลิกอัตโนมัติ`)

            // เริ่ม timer สำหรับ auto-cancel
            scheduleAutoCancellation(reservation.reservationId, checkInDeadline)

            return res.status(200).json({
                success: true,
                message: 'อนุมัติการจองสำเร็จ และส่งการแจ้งเตือนไปยังผู้จองแล้ว',
                data: {
                    ...reservation.toJSON(),
                    checkInDeadline: checkInDeadline.toISOString()
                }
            })
        }

        // กรณีอื่นๆ เปลี่ยนสถานะปกติ
        reservation.status = status
        await reservation.save()

        return res.status(200).json({
            success: true,
            message: 'อัพเดทสถานะสำเร็จ',
            data: reservation
        })
    } catch (error) {
        console.error('Error updating reservation status:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ'
        })
    }
}

// Check-in สำหรับ user
const checkInReservation = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.uid

        const reservation = await Reservation.findOne({
            where: {
                reservationId: id,
                userId
            }
        })

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบการจองที่ระบุ'
            })
        }

        if (reservation.status !== 'awaiting_checkin') {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถ check-in ได้ในสถานะนี้'
            })
        }

        const now = new Date()

        // ตรวจสอบว่าเกิน deadline หรือไม่
        if (now > reservation.checkInDeadline) {
            reservation.status = 'cancelled'
            await reservation.save()

            return res.status(400).json({
                success: false,
                message: 'หมดเวลา check-in แล้ว การจองถูกยกเลิกอัตโนมัติ'
            })
        }

        reservation.status = 'confirmed'
        reservation.checkedInAt = now
        await reservation.save()

        return res.status(200).json({
            success: true,
            message: 'Check-in สำเร็จ',
            data: reservation
        })
    } catch (error) {
        console.error('Error checking in reservation:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการ check-in'
        })
    }
}

// Auto-cancellation scheduler
const scheduledCancellations = new Map()

const scheduleAutoCancellation = (reservationId, deadline) => {
    const now = new Date()
    const delay = deadline.getTime() - now.getTime()

    if (delay <= 0) {
        // หมดเวลาแล้ว ยกเลิกทันที
        autoCancelReservation(reservationId)
        return
    }

    // ตั้ง timeout
    const timeoutId = setTimeout(async () => {
        await autoCancelReservation(reservationId)
        scheduledCancellations.delete(reservationId)
    }, delay)

    scheduledCancellations.set(reservationId, timeoutId)
}

const autoCancelReservation = async (reservationId) => {
    try {
        const reservation = await Reservation.findByPk(reservationId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'name', 'email']
                }
            ]
        })

        if (!reservation) {
            console.log(`[AUTO-CANCEL] ไม่พบการจอง #${reservationId}`)
            return
        }

        // ยกเลิกเฉพาะถ้ายังเป็น awaiting_checkin
        if (reservation.status === 'awaiting_checkin') {
            reservation.status = 'cancelled'
            await reservation.save()

            console.log(`[AUTO-CANCEL] ยกเลิกการจอง #${reservationId} เนื่องจากไม่ได้ check-in ภายใน 5 นาที`)
            console.log(`User: ${reservation.user?.name} (ID: ${reservation.userId})`)

            // TODO: ส่ง notification แจ้ง user ว่าการจองถูกยกเลิก
        }
    } catch (error) {
        console.error(`[AUTO-CANCEL] Error cancelling reservation #${reservationId}:`, error)
    }
}

// ดูช่วงเวลาที่ว่างสำหรับ room/seat ในวันที่ระบุ
const getAvailableTimeSlots = async (req, res) => {
    try {
        const { reservationType, itemId, date } = req.query
        if (!reservationType || !itemId || !date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุข้อมูลให้ครบถ้วน'
            })
        }

        // กำหนดเวลาเริ่มต้นทั้งหมดที่สามารถจองได้ (09:00-15:00)
        const allStartTimes = generateAllStartTimes()

        // ดึงช่วงเวลาที่ถูกจองแล้ว
        const bookedReservations = await Reservation.findAll({
            where: {
                reservationType,
                itemId,
                reservationDate: date,
                status: {
                    [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
                }
            },
            attributes: ['timeSlot']
        })

        // แปลง timeSlot (HH:MM-HH:MM) กลับเป็นเวลาเริ่มต้น (HH:MM)
        const bookedStartTimes = bookedReservations.map(r => extractStartTime(r.timeSlot))
        const availableStartTimes = allStartTimes.filter(time => !bookedStartTimes.includes(time))

        return res.status(200).json({
            success: true,
            data: {
                allStartTimes,
                bookedStartTimes,
                availableStartTimes
            }
        })
    } catch (error) {
        console.error('Error getting available time slots:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลช่วงเวลาว่าง'
        })
    }
}

// ดูห้อง Karaoke ทั้งหมดพร้อมสถานะการจอง
const getKaraokeRoomsWithStatus = async (req, res) => {
    try {
        const { date } = req.query

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุวันที่'
            })
        }

        // ดึงห้อง Karaoke ทั้งหมด
        const rooms = await KaraokeRoom.findAll({
            where: { status: true }, // เฉพาะห้องที่เปิดใช้งาน
            order: [['karaokeId', 'ASC']]
        })

        // ดึงการจองทั้งหมดในวันที่ระบุ
        const reservations = await Reservation.findAll({
            where: {
                reservationType: 'karaoke',
                reservationDate: date,
                status: {
                    [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'name', 'email']
                }
            ]
        })

        // จัดกลุ่มการจองตาม itemId (karaokeId)
        const reservationsByRoom = {}
        reservations.forEach(r => {
            if (!reservationsByRoom[r.itemId]) {
                reservationsByRoom[r.itemId] = []
            }
            reservationsByRoom[r.itemId].push(r)
        })

        // รวมข้อมูลห้องกับการจอง
        const roomsWithStatus = rooms.map(room => {
            const roomReservations = reservationsByRoom[room.karaokeId] || []
            return {
                ...room.toJSON(),
                reservations: roomReservations,
                isBooked: roomReservations.length > 0
            }
        })

        return res.status(200).json({
            success: true,
            data: roomsWithStatus
        })
    } catch (error) {
        console.error('Error getting karaoke rooms with status:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง Karaoke'
        })
    }
}

// ดูที่นั่งหนังทั้งหมดพร้อมสถานะการจอง
const getMovieSeatsWithStatus = async (req, res) => {
    try {
        const { date } = req.query

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุวันที่'
            })
        }

        // ดึงที่นั่งหนังทั้งหมด
        const seats = await MovieSeat.findAll({
            where: { status: true }, // เฉพาะที่นั่งที่เปิดใช้งาน
            order: [['movieId', 'ASC']]
        })

        // ดึงการจองทั้งหมดในวันที่ระบุ
        const reservations = await Reservation.findAll({
            where: {
                reservationType: 'movie',
                reservationDate: date,
                status: {
                    [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'name', 'email']
                }
            ]
        })

        // จัดกลุ่มการจองตาม itemId (movieId)
        const reservationsBySeat = {}
        reservations.forEach(r => {
            if (!reservationsBySeat[r.itemId]) {
                reservationsBySeat[r.itemId] = []
            }
            reservationsBySeat[r.itemId].push(r)
        })

        // รวมข้อมูลที่นั่งกับการจอง
        const seatsWithStatus = seats.map(seat => {
            const seatReservations = reservationsBySeat[seat.movieId] || []
            return {
                ...seat.toJSON(),
                reservations: seatReservations,
                isBooked: seatReservations.length > 0
            }
        })

        return res.status(200).json({
            success: true,
            data: seatsWithStatus
        })
    } catch (error) {
        console.error('Error getting movie seats with status:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลที่นั่งหนัง'
        })
    }
}

// ดูรายละเอียดห้อง/ที่นั่ง พร้อมข้อมูลการจองปัจจุบัน
const getRoomSeatDetails = async (req, res) => {
    try {
        const { type, id, date } = req.query

        if (!type || !id || !date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุ type (karaoke/movie), id, และ date'
            })
        }

        if (!['karaoke', 'movie'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'type ต้องเป็น karaoke หรือ movie'
            })
        }

        // ดึงข้อมูลห้อง/ที่นั่ง
        let item
        if (type === 'karaoke') {
            item = await KaraokeRoom.findByPk(id)
        } else {
            item = await MovieSeat.findByPk(id)
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบห้อง/ที่นั่งที่ระบุ'
            })
        }

        // ดึงการจองทั้งหมดของห้อง/ที่นั่งนี้ในวันที่ระบุ
        const reservations = await Reservation.findAll({
            where: {
                reservationType: type,
                itemId: id,
                reservationDate: date,
                status: {
                    [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
                }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'name', 'email']
                }
            ],
            order: [['timeSlot', 'ASC']]
        })

        // เพิ่มข้อมูลเวลาสิ้นสุดให้แต่ละการจอง
        const reservationsWithEndTime = reservations.map(r => {
            const [startTime, endTime] = r.timeSlot.split('-')
            return {
                ...r.toJSON(),
                startTime,
                endTime,
                willEndAt: `${date} ${endTime}` // รวมวันที่กับเวลาสิ้นสุด
            }
        })

        return res.status(200).json({
            success: true,
            data: {
                item: item.toJSON(),
                type,
                date,
                reservations: reservationsWithEndTime,
                totalReservations: reservations.length
            }
        })
    } catch (error) {
        console.error('Error getting room/seat details:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        })
    }
}

module.exports = {
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
}
