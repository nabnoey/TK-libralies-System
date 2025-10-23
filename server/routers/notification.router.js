const express = require('express')
const router = express.Router()
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notification.controller')

const requireAuth = require('../middlewares/requireAuth')

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter only unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', requireAuth, getUserNotifications)

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/:id/read', requireAuth, markAsRead)

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch('/read-all', requireAuth, markAllAsRead)

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', requireAuth, deleteNotification)

module.exports = router
