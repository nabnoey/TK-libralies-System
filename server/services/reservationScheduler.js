const cron = require('node-cron')
const { Reservation, KaraokeRoom, MovieSeat } = require('../models/associations')
const { Op } = require('sequelize')
const { getBangkokTime, getTodayDate } = require('../utils/dateHelper')
const { createNotification } = require('../controllers/notification.controller')

// ระยะเวลาการใช้งาน (นาที)
const KARAOKE_DURATION = 90 // 90 นาที
const MOVIE_DURATION = 150 // 2 ชั่วโมง 30 นาที (150 นาที)

// อัพเดทสถานะห้อง/ที่นั่ง
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
            console.log(`[CRON UPDATE] Karaoke #${itemId} -> ${newStatus}`)
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
            console.log(`[CRON UPDATE] Movie Seat #${itemId} -> ${newStatus}`)
        }
    } catch (error) {
        console.error('[CRON UPDATE ERROR]', error)
    }
}

// ตรวจสอบและเปลี่ยนสถานะการจองที่หมดเวลาใช้งาน
const checkExpiredReservations = async () => {
    try {
        const now = getBangkokTime()
        const today = getTodayDate()

        console.log(`[CRON] เริ่มตรวจสอบการจองที่หมดเวลา - ${now.format('YYYY-MM-DD HH:mm:ss')}`)

        // หาการจอง karaoke ที่ confirmed และหมดเวลาแล้ว (เกิน 90 นาที)
        const expiredKaraokeReservations = await Reservation.findAll({
            where: {
                reservationType: 'karaoke',
                status: 'confirmed',
                reservationDate: today,
                checkedInAt: {
                    [Op.not]: null
                }
            }
        })

        for (const reservation of expiredKaraokeReservations) {
            const checkedInTime = getBangkokTime(reservation.checkedInAt)
            const minutesUsed = now.diff(checkedInTime, 'minutes')

            if (minutesUsed >= KARAOKE_DURATION) {
                console.log(`[CRON] Karaoke Reservation #${reservation.reservationId} หมดเวลา (${minutesUsed} นาที)`)

                // เปลี่ยนสถานะเป็น completed
                reservation.status = 'completed'
                reservation.endedAt = now.toDate()
                await reservation.save()

                // อัพเดทสถานะห้องเป็น available
                await updateRoomStatus('karaoke', reservation.itemId, 'available', null)

                // ดึงชื่อห้อง
                const room = await KaraokeRoom.findByPk(reservation.itemId)
                const roomName = room ? room.name : `#${reservation.itemId}`

                // ส่งแจ้งเตือน
                await createNotification({
                    userId: reservation.userId,
                    reservationId: reservation.reservationId,
                    type: 'reservation_completed',
                    title: 'เวลาใช้งานหมดแล้ว',
                    message: `การใช้งานคาราโอเกะ ${roomName} ของคุณหมดเวลาแล้ว (90 นาที) กรุณาออกจากห้อง`,
                    metadata: {
                        roomType: 'karaoke',
                        itemId: reservation.itemId,
                        itemName: roomName,
                        duration: minutesUsed,
                        autoCompleted: true
                    }
                })

                console.log(`[CRON] ส่งแจ้งเตือนไปยัง User #${reservation.userId}`)
            }
        }

        // หาการจอง movie ที่ confirmed และหมดเวลาแล้ว (เกิน 150 นาที)
        const expiredMovieReservations = await Reservation.findAll({
            where: {
                reservationType: 'movie',
                status: 'confirmed',
                reservationDate: today,
                checkedInAt: {
                    [Op.not]: null
                }
            }
        })

        for (const reservation of expiredMovieReservations) {
            const checkedInTime = getBangkokTime(reservation.checkedInAt)
            const minutesUsed = now.diff(checkedInTime, 'minutes')

            if (minutesUsed >= MOVIE_DURATION) {
                console.log(`[CRON] Movie Reservation #${reservation.reservationId} หมดเวลา (${minutesUsed} นาที)`)

                // เปลี่ยนสถานะเป็น completed
                reservation.status = 'completed'
                reservation.endedAt = now.toDate()
                await reservation.save()

                // อัพเดทสถานะที่นั่งเป็น available
                await updateRoomStatus('movie', reservation.itemId, 'available', null)

                // ดึงชื่อที่นั่ง
                const seat = await MovieSeat.findByPk(reservation.itemId)
                const seatName = seat ? seat.name : `#${reservation.itemId}`

                // ส่งแจ้งเตือน
                await createNotification({
                    userId: reservation.userId,
                    reservationId: reservation.reservationId,
                    type: 'reservation_completed',
                    title: 'เวลาใช้งานหมดแล้ว',
                    message: `การใช้งานที่นั่งหนัง ${seatName} ของคุณหมดเวลาแล้ว (2 ชั่วโมง 30 นาที) กรุณาออกจากที่นั่ง`,
                    metadata: {
                        roomType: 'movie',
                        itemId: reservation.itemId,
                        itemName: seatName,
                        duration: minutesUsed,
                        autoCompleted: true
                    }
                })

                console.log(`[CRON] ส่งแจ้งเตือนไปยัง User #${reservation.userId}`)
            }
        }

        console.log(`[CRON] ตรวจสอบเสร็จสิ้น - พบ Karaoke หมดเวลา ${expiredKaraokeReservations.filter(r => {
            const checkedInTime = getBangkokTime(r.checkedInAt)
            const minutesUsed = now.diff(checkedInTime, 'minutes')
            return minutesUsed >= KARAOKE_DURATION
        }).length} รายการ, Movie หมดเวลา ${expiredMovieReservations.filter(r => {
            const checkedInTime = getBangkokTime(r.checkedInAt)
            const minutesUsed = now.diff(checkedInTime, 'minutes')
            return minutesUsed >= MOVIE_DURATION
        }).length} รายการ`)

    } catch (error) {
        console.error('[CRON ERROR] เกิดข้อผิดพลาดในการตรวจสอบการจองที่หมดเวลา:', error)
    }
}

// เริ่มต้น cron job - ทำงานทุก 1 นาที
const startReservationScheduler = () => {
    // ทำงานทุก 1 นาที
    cron.schedule('* * * * *', async () => {
        await checkExpiredReservations()
    })

    console.log('[CRON] Reservation Scheduler เริ่มทำงานแล้ว - ตรวจสอบทุก 1 นาที')
    console.log(`[CRON] Karaoke Duration: ${KARAOKE_DURATION} นาที`)
    console.log(`[CRON] Movie Duration: ${MOVIE_DURATION} นาที`)
}

module.exports = {
    startReservationScheduler,
    checkExpiredReservations
}
