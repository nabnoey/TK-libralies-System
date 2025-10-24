const { DataTypes } = require('sequelize')
const sequelize = require('./db')

const Notification = sequelize.define("Notification", {
    notificationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    reservationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'reservations',
            key: 'reservationId'
        }
    },
    type: {
        type: DataTypes.ENUM(
            'reservation_approved',
            'reservation_rejected',
            'checkin_reminder',
            'reservation_cancelled',
            'queue_ready',
            'queue_update'
        ),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
        {
            name: 'idx_user_notifications',
            fields: ['userId', 'isRead', 'createdAt']
        },
        {
            name: 'idx_reservation_notifications',
            fields: ['reservationId']
        }
    ]
})

// ลบ individual sync ออก - ใช้ sync จาก index.js แทน

module.exports = Notification
