const Notification = require('../models/notification.model')
const { Reservation, KaraokeRoom, MovieSeat } = require('../models/associations')

// สร้างการแจ้งเตือน
const createNotification = async ({ userId, reservationId, type, title, message, metadata }) => {
    try {
        const notification = await Notification.create({
            userId,
            reservationId,
            type,
            title,
            message,
            metadata
        })
        console.log(`[NOTIFICATION] Created notification ID: ${notification.notificationId} for User ID: ${userId}`)
        return notification
    } catch (error) {
        console.error('[NOTIFICATION] Error creating notification:', error)
        throw error
    }
}

// ดึงการแจ้งเตือนทั้งหมดของ user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.uid
        const { unreadOnly } = req.query

        const whereClause = { userId }
        if (unreadOnly === 'true') {
            whereClause.isRead = false
        }

        const notifications = await Notification.findAll({
            where: whereClause,
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    required: false,
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
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50 // จำกัดแค่ 50 รายการล่าสุด
        })

        // นับจำนวนที่ยังไม่ได้อ่าน
        const unreadCount = await Notification.count({
            where: {
                userId,
                isRead: false
            }
        })

        return res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        })
    } catch (error) {
        console.error('Error getting user notifications:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน'
        })
    }
}

// ทำเครื่องหมายว่าอ่านแล้ว
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.uid

        const notification = await Notification.findOne({
            where: {
                notificationId: id,
                userId
            }
        })

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบการแจ้งเตือนที่ระบุ'
            })
        }

        if (!notification.isRead) {
            notification.isRead = true
            notification.readAt = new Date()
            await notification.save()
        }

        return res.status(200).json({
            success: true,
            message: 'ทำเครื่องหมายว่าอ่านแล้ว',
            data: notification
        })
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน'
        })
    }
}

// ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.uid

        await Notification.update(
            {
                isRead: true,
                readAt: new Date()
            },
            {
                where: {
                    userId,
                    isRead: false
                }
            }
        )

        return res.status(200).json({
            success: true,
            message: 'ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว'
        })
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน'
        })
    }
}

// ลบการแจ้งเตือน
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.uid

        const notification = await Notification.findOne({
            where: {
                notificationId: id,
                userId
            }
        })

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบการแจ้งเตือนที่ระบุ'
            })
        }

        await notification.destroy()

        return res.status(200).json({
            success: true,
            message: 'ลบการแจ้งเตือนสำเร็จ'
        })
    } catch (error) {
        console.error('Error deleting notification:', error)
        return res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบการแจ้งเตือน'
        })
    }
}

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
}
