const { DataTypes } = require('sequelize')
const sequelize = require('./db')

const Reservation = sequelize.define("reservations", {
    reservationId: {
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
    reservationType: {
        type: DataTypes.ENUM('karaoke', 'movie'),
        allowNull: false
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reservationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    numberOfPeople: {
        type: DataTypes.VIRTUAL,
        get() {
            // คำนวณจาก friendEmails.length + 1 (ผู้จอง)
            const friendEmails = this.getDataValue('friendEmails') || []
            return friendEmails.length + 1
        }
    },
    friendEmails: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidLength(value) {
                const totalPeople = value.length + 1 // +1 for the user who books
                if (totalPeople < 4 || totalPeople > 6) {
                    throw new Error('Total people must be 4-6 (including you)')
                }
            }
        }
    },
    timeSlot: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isValidTimeSlot(value) {
                // ถ้าเป็น null หรือ undefined ให้ผ่าน (สำหรับ karaoke)
                if (!value) return

                const timeSlotRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/
                if (!timeSlotRegex.test(value)) {
                    throw new Error('Invalid timeSlot format, must be "HH:MM-HH:MM"')
                }

                const [startTime, endTime] = value.split('-')
                const [startHour, startMin] = startTime.split(':').map(Number)
                const [endHour, endMin] = endTime.split(':').map(Number)

                if (startHour < 9 || endHour > 16) {
                    throw new Error('timeSlot must be between 09:00-16:00')
                }

                const startMinutes = startHour * 60 + startMin
                const endMinutes = endHour * 60 + endMin
                const duration = endMinutes - startMinutes

                if (duration !== 60) {
                    throw new Error('Reservation duration must be exactly 1 hour')
                }
            }
        }
    },
    queueNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'awaiting_checkin', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    checkInDeadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    checkedInAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'reservations',
    timestamps: true,
    indexes: [
        {
            name: 'idx_user_date_status',
            fields: ['userId', 'reservationDate', 'status']
        },
        {
            name: 'idx_item_availability',
            fields: ['reservationType', 'itemId', 'reservationDate', 'timeSlot']
        }
    ]
})

// ลบ individual sync ออก - ใช้ sync จาก index.js แทน

module.exports = Reservation
