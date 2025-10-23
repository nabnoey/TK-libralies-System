const { Reservation, User, KaraokeRoom, MovieSeat } = require('../models/associations')
const { Op } = require('sequelize')
const { createNotification } = require('./notification.controller')
const { getBangkokTime, getTodayDate, getCurrentHour, isAfterTime, addMinutes } = require('../utils/dateHelper')

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

// Helper: อัพเดทสถานะห้อง/ที่นั่ง
const updateRoomStatus = async (reservationType, itemId, newStatus, reservationId = null) => {
    try {
        if (reservationType === 'karaoke') {
            await KaraokeRoom.update(
                {
                    currentStatus: newStatus,
                    currentReservationId: reservationId
                },
                {
                    where: { karaokeId: itemId }
                }
            )
            console.log(`[UPDATE ROOM STATUS] Karaoke #${itemId} -> ${newStatus} (Reservation: ${reservationId || 'none'})`)
        } else if (reservationType === 'movie') {
            await MovieSeat.update(
                {
                    currentStatus: newStatus,
                    currentReservationId: reservationId
                },
                {
                    where: { movieId: itemId }
                }
            )
            console.log(`[UPDATE ROOM STATUS] Movie Seat #${itemId} -> ${newStatus} (Reservation: ${reservationId || 'none'})`)
        }
    } catch (error) {
        console.error('[UPDATE ROOM STATUS ERROR]', error)
    }
}

// ตรวจสอบว่า user มีการจองที่ยังไม่เสร็จสิ้นหรือไม่ (ทุกประเภท)
const checkUserActiveReservation = async (userId, reservationDate) => {
    // เช็คว่ามีการจองที่ยังไม่ completed (ทุกประเภท)
    const existingReservation = await Reservation.findOne({
        where: {
            userId,
            reservationDate,
            status: {
                [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
            }
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
    return existingReservation
}

// ตรวจสอบว่า user มีการจองประเภทเดียวกันในวันเดียวกันแล้วหรือไม่ (รวมทั้ง completed)
const checkUserDailyReservationLimit = async (userId, reservationDate, reservationType) => {
    const existingReservation = await Reservation.findOne({
        where: {
            userId,
            reservationDate,
            reservationType,
            status: {
                [Op.in]: ['pending', 'awaiting_checkin', 'confirmed', 'completed']
            }
        }
    })
    return existingReservation
}

// ตรวจสอบว่า user เคย cancel การจองประเภทนี้ในวันนี้ไปแล้วหรือไม่
const checkUserCancelledReservation = async (userId, reservationDate, reservationType) => {
    const cancelledReservation = await Reservation.findOne({
        where: {
            userId,
            reservationDate,
            reservationType,
            status: 'cancelled'
        }
    })
    return cancelledReservation
}

// สร้างการจอง
const createReservation = async (req, res) => {
    try {
        const { reservationType, itemId, friendEmails } = req.body
        const userId = req.user.uid // จาก middleware authentication

        // ใช้วันที่ปัจจุบันตาม timezone Bangkok เป็น default
        const reservationDate = req.body.reservationDate || getTodayDate()

        // ตรวจสอบว่ามีข้อมูลครบหรือไม่
        if (!reservationType || !itemId || !friendEmails) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน (reservationType, itemId, friendEmails)'
            })
        }

        // ตรวจสอบว่า reservationType ถูกต้องหรือไม่
        if (!['karaoke', 'movie'].includes(reservationType)) {
            return res.status(400).json({
                success: false,
                message: 'ประเภทการจองไม่ถูกต้อง'
            })
        }

        // ตรวจสอบว่า friendEmails เป็น array หรือไม่
        if (!Array.isArray(friendEmails)) {
            return res.status(400).json({
                success: false,
                message: 'friendEmails ต้องเป็น array'
            })
        }

        // ตรวจสอบจำนวนคนทั้งหมด (รวมผู้จอง)
        const totalPeople = friendEmails.length + 1 // +1 = ผู้จอง
        if (totalPeople < 4 || totalPeople > 6) {
            return res.status(400).json({
                success: false,
                message: `จำนวนคนทั้งหมด (รวมคุณ) ต้องอยู่ระหว่าง 4-6 คน (ปัจจุบัน: ${totalPeople} คน - ต้องระบุ email เพื่อน 3-5 คน)`
            })
        }

        // ตรวจสอบว่าเพื่อนทุกคนเป็น user ที่ลงทะเบียนแล้ว
        const friends = await User.findAll({
            where: {
                email: {
                    [Op.in]: friendEmails
                }
            },
            attributes: ['userId', 'email', 'name']
        })

        // ตรวจสอบว่าพบ user ครบทุกคนหรือไม่
        if (friends.length !== friendEmails.length) {
            const foundEmails = friends.map(f => f.email)
            const notFoundEmails = friendEmails.filter(email => !foundEmails.includes(email))
            return res.status(400).json({
                success: false,
                message: 'พบ email ที่ไม่ได้ลงทะเบียน',
                notFoundEmails
            })
        }

        // ตรวจสอบว่าผู้จองไม่ได้ใส่ email ตัวเองใน friendEmails
        const currentUserEmail = req.user.email
        if (friendEmails.includes(currentUserEmail)) {
            return res.status(400).json({
                success: false,
                message: 'ไม่ต้องใส่ email ของคุณเองใน friendEmails'
            })
        }

        // ตรวจสอบว่า user มีการจองที่ยังไม่เสร็จสิ้นหรือไม่ (ทุกประเภท)
        const activeReservation = await checkUserActiveReservation(userId, reservationDate)
        if (activeReservation) {
            const existingType = activeReservation.reservationType === 'karaoke' ? 'คาราโอเกะ' : 'หนัง'
            const existingItemName = activeReservation.reservationType === 'karaoke'
                ? activeReservation.karaokeRoom?.name || `ห้อง #${activeReservation.itemId}`
                : activeReservation.movieSeat?.name || `ที่นั่ง #${activeReservation.itemId}`

            return res.status(400).json({
                success: false,
                message: `คุณมีการจอง${existingType}ที่ยังไม่เสร็จสิ้น (${existingItemName}, สถานะ: ${activeReservation.status}) กรุณารอให้การจองปัจจุบันเสร็จสิ้นก่อนจึงจะสามารถจองอันใหม่ได้`,
                existingReservation: {
                    reservationId: activeReservation.reservationId,
                    type: existingType,
                    itemName: existingItemName,
                    status: activeReservation.status,
                    queueNumber: activeReservation.queueNumber,
                    reservationDate: activeReservation.reservationDate
                }
            })
        }

        // ตรวจสอบว่า user มีการจองประเภทเดียวกันในวันนี้แล้วหรือไม่ (รวมทั้ง completed)
        const dailyReservation = await checkUserDailyReservationLimit(userId, reservationDate, reservationType)
        if (dailyReservation) {
            const typeName = reservationType === 'karaoke' ? 'คาราโอเกะ' : 'หนัง'
            return res.status(400).json({
                success: false,
                message: `คุณสามารถจอง${typeName}ได้เพียง 1 รอบต่อวันเท่านั้น (คุณมีการจองแล้วในวันนี้ - สถานะ: ${dailyReservation.status})`,
                existingReservation: {
                    reservationId: dailyReservation.reservationId,
                    status: dailyReservation.status,
                    queueNumber: dailyReservation.queueNumber
                }
            })
        }

        // ตรวจสอบว่าเคย cancel การจองประเภทนี้ในวันนี้ไปแล้วหรือไม่
        const cancelledReservation = await checkUserCancelledReservation(userId, reservationDate, reservationType)
        if (cancelledReservation) {
            return res.status(400).json({
                success: false,
                message: `คุณได้ยกเลิกการจอง${reservationType === 'karaoke' ? 'คาราโอเกะ' : 'หนัง'}ในวันนี้ไปแล้ว ไม่สามารถจองซ้ำได้`
            })
        }

        // === สำหรับ KARAOKE ===
        if (reservationType === 'karaoke') {
            // ตรวจสอบว่าปิดรับจองหรือยัง (ปิดรับหลัง 15:00)
            const today = getTodayDate()
            if (reservationDate === today && isAfterTime(15, 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'ปิดรับจองแล้ว (หลัง 15:00 น.)'
                })
            }

            // ตรวจสอบว่าห้องมีอยู่จริงหรือไม่
            const karaokeRoom = await KaraokeRoom.findByPk(itemId)
            if (!karaokeRoom) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบห้องคาราโอเกะที่ระบุ'
                })
            }

            // ตรวจสอบว่าห้องเปิดใช้งานหรือไม่
            if (!karaokeRoom.status) {
                return res.status(400).json({
                    success: false,
                    message: 'ห้องนี้ปิดให้บริการ'
                })
            }

            // หาคิวปัจจุบันในห้องนี้ (เฉพาะที่ยังไม่เสร็จสิ้น)
            const existingQueue = await Reservation.findAll({
                where: {
                    reservationType: 'karaoke',
                    itemId,
                    reservationDate,
                    status: {
                        [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
                    }
                },
                order: [['queueNumber', 'ASC']]
            })

            // หา queueNumber ถัดไป
            const nextQueueNumber = existingQueue.length > 0
                ? Math.max(...existingQueue.map(r => r.queueNumber)) + 1
                : 1

            // สร้างการจอง
            const reservation = await Reservation.create({
                userId,
                reservationType,
                itemId,
                reservationDate,
                friendEmails,
                timeSlot: null, // karaoke ไม่ใช้ timeSlot
                queueNumber: nextQueueNumber,
                status: 'pending'
            })

            return res.status(201).json({
                success: true,
                message: nextQueueNumber === 1
                    ? 'จองสำเร็จ! คุณอยู่คิวที่ 1 รอ admin อนุมัติ'
                    : `จองสำเร็จ! คุณอยู่คิวที่ ${nextQueueNumber}`,
                data: {
                    ...reservation.toJSON(),
                    queuePosition: nextQueueNumber,
                    peopleAhead: nextQueueNumber - 1,
                    friends: friends.map(f => ({ email: f.email, name: f.name }))
                }
            })
        }

        // === สำหรับ MOVIE ===
        if (reservationType === 'movie') {
            // ตรวจสอบว่าปิดรับจองหรือยัง (ปิดรับหลัง 14:00)
            const today = getTodayDate()
            if (reservationDate === today && isAfterTime(14, 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'ปิดรับจองแล้ว (หลัง 14:00 น.)'
                })
            }

            // ตรวจสอบว่าที่นั่งมีอยู่จริงหรือไม่
            const movieSeat = await MovieSeat.findByPk(itemId)
            if (!movieSeat) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบที่นั่งหนังที่ระบุ'
                })
            }

            // ตรวจสอบว่าที่นั่งเปิดใช้งานหรือไม่
            if (!movieSeat.status) {
                return res.status(400).json({
                    success: false,
                    message: 'ที่นั่งนี้ปิดให้บริการ'
                })
            }

            // หาคิวปัจจุบันในที่นั่งนี้ (เฉพาะที่ยังไม่เสร็จสิ้น)
            const existingQueue = await Reservation.findAll({
                where: {
                    reservationType: 'movie',
                    itemId,
                    reservationDate,
                    status: {
                        [Op.in]: ['pending', 'awaiting_checkin', 'confirmed']
                    }
                },
                order: [['queueNumber', 'ASC']]
            })

            // หา queueNumber ถัดไป
            const nextQueueNumber = existingQueue.length > 0
                ? Math.max(...existingQueue.map(r => r.queueNumber)) + 1
                : 1

            // สร้างการจอง
            const reservation = await Reservation.create({
                userId,
                reservationType,
                itemId,
                reservationDate,
                friendEmails,
                timeSlot: null, // movie ไม่ใช้ timeSlot แล้ว
                queueNumber: nextQueueNumber,
                status: 'pending'
            })

            return res.status(201).json({
                success: true,
                message: nextQueueNumber === 1
                    ? 'จองสำเร็จ! คุณอยู่คิวที่ 1 รอ admin อนุมัติ'
                    : `จองสำเร็จ! คุณอยู่คิวที่ ${nextQueueNumber}`,
                data: {
                    ...reservation.toJSON(),
                    queuePosition: nextQueueNumber,
                    peopleAhead: nextQueueNumber - 1,
                    friends: friends.map(f => ({ email: f.email, name: f.name }))
                }
            })
        }
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

        // เก็บข้อมูลก่อนยกเลิก
        const wasActiveReservation = ['awaiting_checkin', 'confirmed'].includes(reservation.status)
        const reservationType = reservation.reservationType
        const itemId = reservation.itemId
        const oldStatus = reservation.status

        reservation.status = 'cancelled'
        await reservation.save()

        // ถ้าการจองนี้กำลังใช้งานอยู่ (awaiting_checkin หรือ confirmed) ให้อัพเดทสถานะห้องเป็น available
        if (wasActiveReservation) {
            await updateRoomStatus(reservationType, itemId, 'available', null)
        }

        // ส่ง notification แจ้งว่าการจองถูกยกเลิก
        let itemName = ''
        if (reservationType === 'karaoke') {
            const room = await KaraokeRoom.findByPk(itemId)
            itemName = room ? room.name : `#${itemId}`
        } else {
            const seat = await MovieSeat.findByPk(itemId)
            itemName = seat ? seat.name : `#${itemId}`
        }

        const roomType = reservationType === 'karaoke' ? 'คาราโอเกะ' : 'หนัง'
        await createNotification({
            userId: reservation.userId,
            reservationId: reservation.reservationId,
            type: 'reservation_cancelled',
            title: 'การจองถูกยกเลิก',
            message: `คุณได้ยกเลิกการจอง${roomType} ${itemName} (คิวที่ ${reservation.queueNumber}) แล้ว`,
            metadata: {
                queueNumber: reservation.queueNumber,
                roomType: reservationType,
                itemId: itemId,
                itemName,
                reason: 'user_cancelled',
                previousStatus: oldStatus
            }
        })

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

        // ป้องกันการอัปเดต status ของการจองที่ถูก cancelled แล้ว
        if (reservation.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถอัปเดตสถานะของการจองที่ถูกยกเลิกแล้ว'
            })
        }

        // ถ้า admin เปลี่ยนจาก pending -> awaiting_checkin (approve)
        if (reservation.status === 'pending' && status === 'awaiting_checkin') {
            // ตรวจสอบว่าห้อง/ที่นั่งนี้มีการจองที่ยังไม่เสร็จสิ้นอยู่หรือไม่
            // (status: awaiting_checkin หรือ confirmed)
            const activeReservation = await Reservation.findOne({
                where: {
                    reservationType: reservation.reservationType,
                    itemId: reservation.itemId,
                    reservationDate: reservation.reservationDate,
                    status: {
                        [Op.in]: ['awaiting_checkin', 'confirmed'] // มีคนรออยู่หรือกำลังใช้งาน
                    },
                    reservationId: {
                        [Op.ne]: reservation.reservationId // ไม่รวมตัวเอง
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

            // ถ้ามีคนใช้งานอยู่แล้วหรือรอ check-in อยู่ ไม่ให้อนุมัติ
            if (activeReservation) {
                const roomType = reservation.reservationType === 'karaoke' ? 'ห้องคาราโอเกะ' : 'ที่นั่งหนัง'
                const statusText = activeReservation.status === 'confirmed'
                    ? 'กำลังใช้งานอยู่'
                    : 'รอ check-in อยู่'

                return res.status(400).json({
                    success: false,
                    message: `${roomType}นี้${statusText} (คิวที่ ${activeReservation.queueNumber} - ${activeReservation.user?.name || 'Unknown'}) กรุณารอให้เสร็จสิ้น (completed) ก่อน`,
                    data: {
                        currentQueue: activeReservation.queueNumber,
                        currentUser: activeReservation.user,
                        currentStatus: activeReservation.status,
                        requestedQueue: reservation.queueNumber
                    }
                })
            }

            const now = getBangkokTime().toDate()
            const checkInDeadline = addMinutes(now, 5) // +5 นาที

            reservation.status = status
            reservation.approvedAt = now
            reservation.checkInDeadline = checkInDeadline
            await reservation.save()

            // อัพเดทสถานะห้อง/ที่นั่ง เป็น awaiting_checkin
            await updateRoomStatus(reservation.reservationType, reservation.itemId, 'awaiting_checkin', reservation.reservationId)

            // ส่ง notification ไปหา user
            const roomType = reservation.reservationType === 'karaoke' ? 'คาราโอเกะ' : 'ที่นั่งหนัง'
            await createNotification({
                userId: reservation.userId,
                reservationId: reservation.reservationId,
                type: 'reservation_approved',
                title: 'การจองได้รับการอนุมัติ',
                message: `การจอง${roomType}ของคุณได้รับการอนุมัติแล้ว กรุณา check-in ภายใน 5 นาที`,
                metadata: {
                    queueNumber: reservation.queueNumber,
                    checkInDeadline: checkInDeadline.toISOString()
                }
            })

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

        // ถ้า admin พยายามเปลี่ยนเป็น confirmed (ข้ามขั้นตอน check-in)
        if (status === 'confirmed' && reservation.status !== 'awaiting_checkin') {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถเปลี่ยนเป็น confirmed ได้โดยตรง ต้อง approve เป็น awaiting_checkin และให้ user check-in ก่อน'
            })
        }

        // ถ้า admin พยายามเปลี่ยนจาก awaiting_checkin -> confirmed (force check-in)
        if (status === 'confirmed' && reservation.status === 'awaiting_checkin') {
            // ตรวจสอบว่าห้อง/ที่นั่งนี้มีการจองที่ confirmed อยู่แล้วหรือไม่
            const confirmedReservation = await Reservation.findOne({
                where: {
                    reservationType: reservation.reservationType,
                    itemId: reservation.itemId,
                    reservationDate: reservation.reservationDate,
                    status: 'confirmed',
                    reservationId: {
                        [Op.ne]: reservation.reservationId
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

            if (confirmedReservation) {
                const roomType = reservation.reservationType === 'karaoke' ? 'ห้องคาราโอเกะ' : 'ที่นั่งหนัง'
                return res.status(400).json({
                    success: false,
                    message: `${roomType}นี้มีคนกำลังใช้งานอยู่แล้ว (คิวที่ ${confirmedReservation.queueNumber} - ${confirmedReservation.user?.name || 'Unknown'}) ไม่สามารถ force check-in ได้`,
                    data: {
                        currentQueue: confirmedReservation.queueNumber,
                        currentUser: confirmedReservation.user,
                        requestedQueue: reservation.queueNumber
                    }
                })
            }

            // Force check-in (admin ทำแทน user)
            reservation.status = status
            reservation.checkedInAt = getBangkokTime().toDate()
            await reservation.save()

            // อัพเดทสถานะห้อง/ที่นั่ง เป็น in_use
            await updateRoomStatus(reservation.reservationType, reservation.itemId, 'in_use', reservation.reservationId)

            return res.status(200).json({
                success: true,
                message: 'Force check-in สำเร็จ (admin ทำแทน user)',
                data: reservation
            })
        }

        // ถ้า admin เปลี่ยนเป็น completed (user ออกจากห้องแล้ว)
        if (status === 'completed' && reservation.status === 'confirmed') {
            reservation.status = status
            reservation.endedAt = getBangkokTime().toDate()
            await reservation.save()

            // อัพเดทสถานะห้อง/ที่นั่ง เป็น available
            await updateRoomStatus(reservation.reservationType, reservation.itemId, 'available', null)

            // หาคิวถัดไปในห้อง/ที่นั่งเดียวกัน
            const nextInQueue = await Reservation.findOne({
                where: {
                    reservationType: reservation.reservationType,
                    itemId: reservation.itemId,
                    reservationDate: reservation.reservationDate,
                    queueNumber: reservation.queueNumber + 1,
                    status: {
                        [Op.in]: ['pending', 'awaiting_checkin']
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

            // ถ้ามีคิวถัดไป ส่ง notification
            if (nextInQueue) {
                const roomType = reservation.reservationType === 'karaoke' ? 'ห้องคาราโอเกะ' : 'ที่นั่งหนัง'
                let itemName = ''

                // ดึงชื่อห้อง/ที่นั่ง
                if (reservation.reservationType === 'karaoke') {
                    const room = await KaraokeRoom.findByPk(reservation.itemId)
                    itemName = room ? room.name : `#${reservation.itemId}`
                } else {
                    const seat = await MovieSeat.findByPk(reservation.itemId)
                    itemName = seat ? seat.name : `#${reservation.itemId}`
                }

                await createNotification({
                    userId: nextInQueue.userId,
                    reservationId: nextInQueue.reservationId,
                    type: 'queue_ready',
                    title: 'ถึงคิวของคุณแล้ว!',
                    message: `${roomType} ${itemName} ว่างแล้ว รอ admin อนุมัติการจองของคุณ (คิวที่ ${nextInQueue.queueNumber})`,
                    metadata: {
                        queueNumber: nextInQueue.queueNumber,
                        roomType: reservation.reservationType,
                        itemId: reservation.itemId,
                        itemName
                    }
                })

                console.log(`[QUEUE NOTIFICATION] แจ้งเตือนคิว #${nextInQueue.queueNumber} (User ID: ${nextInQueue.userId})`)
            }

            return res.status(200).json({
                success: true,
                message: nextInQueue
                    ? 'อัพเดทสถานะสำเร็จ และแจ้งเตือนคิวถัดไปแล้ว'
                    : 'อัพเดทสถานะสำเร็จ (ไม่มีคิวถัดไป)',
                data: reservation
            })
        }

        // ถ้าเปลี่ยนเป็น completed แต่ไม่ได้เป็น confirmed
        if (status === 'completed' && reservation.status !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถเปลี่ยนเป็น completed ได้ ต้องเป็น confirmed ก่อน'
            })
        }

        // กรณีอื่นๆ เปลี่ยนสถานะปกติ
        const oldStatus = reservation.status
        reservation.status = status
        await reservation.save()

        // ถ้า admin เปลี่ยนเป็น cancelled ให้ส่ง notification และอัพเดทสถานะห้อง
        if (status === 'cancelled') {
            // อัพเดทสถานะห้อง/ที่นั่งเป็น available ถ้าการจองนั้นกำลัง active
            const wasActive = ['awaiting_checkin', 'confirmed'].includes(oldStatus)
            if (wasActive) {
                await updateRoomStatus(reservation.reservationType, reservation.itemId, 'available', null)
            }

            // ส่ง notification แจ้ง user
            let itemName = ''
            if (reservation.reservationType === 'karaoke') {
                const room = await KaraokeRoom.findByPk(reservation.itemId)
                itemName = room ? room.name : `#${reservation.itemId}`
            } else {
                const seat = await MovieSeat.findByPk(reservation.itemId)
                itemName = seat ? seat.name : `#${reservation.itemId}`
            }

            const roomType = reservation.reservationType === 'karaoke' ? 'คาราโอเกะ' : 'หนัง'
            await createNotification({
                userId: reservation.userId,
                reservationId: reservation.reservationId,
                type: 'reservation_cancelled',
                title: 'การจองถูกยกเลิกโดย Admin',
                message: `การจอง${roomType} ${itemName} (คิวที่ ${reservation.queueNumber}) ถูกยกเลิกโดยผู้ดูแลระบบ`,
                metadata: {
                    queueNumber: reservation.queueNumber,
                    roomType: reservation.reservationType,
                    itemId: reservation.itemId,
                    itemName,
                    reason: 'admin_cancelled',
                    previousStatus: oldStatus
                }
            })
        }

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

        const now = getBangkokTime().toDate()

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

        // อัพเดทสถานะห้อง/ที่นั่ง เป็น in_use
        await updateRoomStatus(reservation.reservationType, reservation.itemId, 'in_use', reservation.reservationId)

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
            const reservationType = reservation.reservationType
            const itemId = reservation.itemId

            reservation.status = 'cancelled'
            await reservation.save()

            // อัพเดทสถานะห้อง/ที่นั่ง เป็น available
            await updateRoomStatus(reservationType, itemId, 'available', null)

            // ดึงชื่อห้อง/ที่นั่ง
            let itemName = ''
            if (reservationType === 'karaoke') {
                const room = await KaraokeRoom.findByPk(itemId)
                itemName = room ? room.name : `#${itemId}`
            } else {
                const seat = await MovieSeat.findByPk(itemId)
                itemName = seat ? seat.name : `#${itemId}`
            }

            // ส่ง notification แจ้ง user ว่าการจองถูกยกเลิกอัตโนมัติ
            const roomType = reservationType === 'karaoke' ? 'คาราโอเกะ' : 'หนัง'
            await createNotification({
                userId: reservation.userId,
                reservationId: reservation.reservationId,
                type: 'reservation_cancelled',
                title: 'การจองถูกยกเลิกอัตโนมัติ',
                message: `การจอง${roomType} ${itemName} (คิวที่ ${reservation.queueNumber}) ถูกยกเลิกเนื่องจากไม่ได้ check-in ภายใน 5 นาที`,
                metadata: {
                    queueNumber: reservation.queueNumber,
                    roomType: reservationType,
                    itemId: itemId,
                    itemName,
                    reason: 'timeout'
                }
            })

            console.log(`[AUTO-CANCEL] ยกเลิกการจอง #${reservationId} เนื่องจากไม่ได้ check-in ภายใน 5 นาที`)
            console.log(`User: ${reservation.user?.name} (ID: ${reservation.userId})`)
            console.log(`[AUTO-CANCEL] ส่ง notification แจ้งเตือนการยกเลิกแล้ว`)
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

// ดูห้อง Karaoke ทั้งหมดพร้อมสถานะการจองและคิว
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

        // ดึงการจองทั้งหมดในวันที่ระบุ (เรียงตาม queue number)
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
            ],
            order: [['queueNumber', 'ASC']]
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
            const roomQueue = reservationsByRoom[room.karaokeId] || []

            // หาคนที่กำลังใช้ห้อง (queue number 1 และ status confirmed)
            const currentUser = roomQueue.find(r => r.queueNumber === 1 && r.status === 'confirmed')

            // คิวที่รอ
            const waitingQueue = roomQueue.filter(r => r.queueNumber > 1 || (r.queueNumber === 1 && r.status !== 'confirmed'))

            return {
                ...room.toJSON(),
                currentUser: currentUser ? {
                    reservationId: currentUser.reservationId,
                    user: currentUser.user,
                    queueNumber: currentUser.queueNumber,
                    startedAt: currentUser.startedAt,
                    status: currentUser.status
                } : null,
                waitingQueue: waitingQueue.map(r => ({
                    reservationId: r.reservationId,
                    user: r.user,
                    queueNumber: r.queueNumber,
                    status: r.status
                })),
                totalQueue: roomQueue.length,
                isAvailable: !currentUser, // ว่างถ้าไม่มีคนใช้งาน
                waitingCount: waitingQueue.length
            }
        })

        // เช็คว่าปิดรับจองหรือยัง
        const today = getTodayDate()
        const isBookingClosed = (date === today && isAfterTime(15, 0))

        return res.status(200).json({
            success: true,
            data: {
                rooms: roomsWithStatus,
                isBookingClosed,
                bookingClosesAt: '15:00'
            }
        })
    } catch (error) {
        console.error('Error getting karaoke rooms with status:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง Karaoke'
        })
    }
}

// ดูที่นั่งหนังทั้งหมดพร้อมสถานะการจองและคิว
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

        // ดึงการจองทั้งหมดในวันที่ระบุ (เรียงตาม queue number)
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
            ],
            order: [['queueNumber', 'ASC']]
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
            const seatQueue = reservationsBySeat[seat.movieId] || []

            // หาคนที่กำลังใช้ที่นั่ง (queue number 1 และ status confirmed)
            const currentUser = seatQueue.find(r => r.queueNumber === 1 && r.status === 'confirmed')

            // คิวที่รอ
            const waitingQueue = seatQueue.filter(r => r.queueNumber > 1 || (r.queueNumber === 1 && r.status !== 'confirmed'))

            return {
                ...seat.toJSON(),
                currentUser: currentUser ? {
                    reservationId: currentUser.reservationId,
                    user: currentUser.user,
                    queueNumber: currentUser.queueNumber,
                    startedAt: currentUser.startedAt,
                    status: currentUser.status
                } : null,
                waitingQueue: waitingQueue.map(r => ({
                    reservationId: r.reservationId,
                    user: r.user,
                    queueNumber: r.queueNumber,
                    status: r.status
                })),
                totalQueue: seatQueue.length,
                isAvailable: !currentUser, // ว่างถ้าไม่มีคนใช้งาน
                waitingCount: waitingQueue.length
            }
        })

        // เช็คว่าปิดรับจองหรือยัง
        const today = getTodayDate()
        const isBookingClosed = (date === today && isAfterTime(14, 0))

        return res.status(200).json({
            success: true,
            data: {
                seats: seatsWithStatus,
                isBookingClosed,
                bookingClosesAt: '14:00'
            }
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

// ดูคิวของห้อง Karaoke แต่ละห้อง
const getKaraokeRoomQueue = async (req, res) => {
    try {
        const { roomId, date } = req.query

        if (!roomId || !date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุ roomId และ date'
            })
        }

        // ตรวจสอบว่าห้องมีอยู่จริง
        const room = await KaraokeRoom.findByPk(roomId)
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบห้องคาราโอเกะที่ระบุ'
            })
        }

        // ดึงคิวทั้งหมดของห้องนี้ในวันที่ระบุ
        const queue = await Reservation.findAll({
            where: {
                reservationType: 'karaoke',
                itemId: roomId,
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
            order: [['queueNumber', 'ASC']]
        })

        // แยกคนที่กำลังใช้ห้องกับคนที่รอคิว
        const currentUser = queue.find(r => r.queueNumber === 1 && r.status === 'confirmed')
        const waitingQueue = queue.filter(r => r.queueNumber > 1 || (r.queueNumber === 1 && r.status !== 'confirmed'))

        return res.status(200).json({
            success: true,
            data: {
                room: room.toJSON(),
                currentUser: currentUser ? {
                    reservationId: currentUser.reservationId,
                    user: currentUser.user,
                    queueNumber: currentUser.queueNumber,
                    startedAt: currentUser.startedAt,
                    status: currentUser.status
                } : null,
                waitingQueue: waitingQueue.map(r => ({
                    reservationId: r.reservationId,
                    user: r.user,
                    queueNumber: r.queueNumber,
                    status: r.status,
                    createdAt: r.createdAt
                })),
                totalInQueue: queue.length,
                isRoomAvailable: !currentUser,
                waitingCount: waitingQueue.length
            }
        })
    } catch (error) {
        console.error('Error getting karaoke room queue:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคิว'
        })
    }
}

// ดูคิวของที่นั่งหนังแต่ละที่นั่ง
const getMovieSeatQueue = async (req, res) => {
    try {
        const { seatId, date } = req.query

        if (!seatId || !date) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุ seatId และ date'
            })
        }

        // ตรวจสอบว่าที่นั่งมีอยู่จริง
        const seat = await MovieSeat.findByPk(seatId)
        if (!seat) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบที่นั่งหนังที่ระบุ'
            })
        }

        // ดึงคิวทั้งหมดของที่นั่งนี้ในวันที่ระบุ
        const queue = await Reservation.findAll({
            where: {
                reservationType: 'movie',
                itemId: seatId,
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
            order: [['queueNumber', 'ASC']]
        })

        // แยกคนที่กำลังใช้ที่นั่งกับคนที่รอคิว
        const currentUser = queue.find(r => r.queueNumber === 1 && r.status === 'confirmed')
        const waitingQueue = queue.filter(r => r.queueNumber > 1 || (r.queueNumber === 1 && r.status !== 'confirmed'))

        return res.status(200).json({
            success: true,
            data: {
                seat: seat.toJSON(),
                currentUser: currentUser ? {
                    reservationId: currentUser.reservationId,
                    user: currentUser.user,
                    queueNumber: currentUser.queueNumber,
                    startedAt: currentUser.startedAt,
                    status: currentUser.status
                } : null,
                waitingQueue: waitingQueue.map(r => ({
                    reservationId: r.reservationId,
                    user: r.user,
                    queueNumber: r.queueNumber,
                    status: r.status,
                    createdAt: r.createdAt
                })),
                totalInQueue: queue.length,
                isSeatAvailable: !currentUser,
                waitingCount: waitingQueue.length
            }
        })
    } catch (error) {
        console.error('Error getting movie seat queue:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคิว'
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
    getRoomSeatDetails,
    getKaraokeRoomQueue,
    getMovieSeatQueue
}
