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
        },
        comment: 'User ที่จะได้รับการแจ้งเตือน'
    },
    reservationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'reservations',
            key: 'reservationId'
        },
        comment: 'การจองที่เกี่ยวข้อง (ถ้ามี)'
    },
    type: {
        type: DataTypes.ENUM(
            'reservation_approved',      // การจองได้รับการอนุมัติ
            'reservation_rejected',      // การจองถูกปฏิเสธ
            'checkin_reminder',          // แจ้งเตือนให้ check-in
            'reservation_cancelled',     // การจองถูกยกเลิก
            'queue_ready',              // ถึงคิวของคุณแล้ว (คนข้างหน้าเสร็จสิ้น)
            'queue_update'              // อัปเดตสถานะคิว
        ),
        allowNull: false,
        comment: 'ประเภทของการแจ้งเตือน'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'หัวข้อการแจ้งเตือน'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'ข้อความแจ้งเตือน'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'อ่านแล้วหรือยัง'
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'เวลาที่อ่านการแจ้งเตือน'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'ข้อมูลเพิ่มเติม (เช่น queueNumber, roomId, etc.)'
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

Notification.sync({ force: false }).then(() => {
    console.log("Notification table created or already existed")
}).catch((error) => {
    console.log("Error while creating Notification table", error)
})

module.exports = Notification
