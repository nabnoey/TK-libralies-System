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
        allowNull: false,
        comment: 'Reference to karaokeId or movieId depending on reservationType'
    },
    reservationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date of reservation (without time)'
    },
    timeSlot: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Time slot for reservation (1-hour slots: "09:00-10:00", "10:00-11:00", ..., "15:00-16:00")',
        validate: {
            isValidTimeSlot(value) {
                // ตรวจสอบรูปแบบ HH:MM-HH:MM
                const timeSlotRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/
                if (!timeSlotRegex.test(value)) {
                    throw new Error('รูปแบบ timeSlot ไม่ถูกต้อง ต้องเป็น "HH:MM-HH:MM"')
                }

                const [startTime, endTime] = value.split('-')
                const [startHour, startMin] = startTime.split(':').map(Number)
                const [endHour, endMin] = endTime.split(':').map(Number)

                // ตรวจสอบว่าอยู่ในช่วง 09:00-16:00
                if (startHour < 9 || endHour > 16) {
                    throw new Error('timeSlot ต้องอยู่ในช่วง 09:00-16:00 เท่านั้น')
                }

                // ตรวจสอบว่าระยะเวลาเท่ากับ 1 ชั่วโมงพอดี
                const startMinutes = startHour * 60 + startMin
                const endMinutes = endHour * 60 + endMin
                const duration = endMinutes - startMinutes

                if (duration !== 60) {
                    throw new Error('ระยะเวลาการจองต้องเป็น 1 ชั่วโมงพอดี')
                }
            }
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'awaiting_checkin', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'pending=รอ admin อนุมัติ, awaiting_checkin=รอ user check-in, confirmed=check-in แล้ว, cancelled=ยกเลิก, completed=เสร็จสิ้น'
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'เวลาที่ admin approve การจอง'
    },
    checkInDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'เวลาที่ user ต้อง check-in ก่อน (approvedAt + 5 นาที) ไม่งั้นจะถูกยกเลิก'
    },
    checkedInAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'เวลาที่ user check-in'
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

Reservation.sync({ force: false }).then(() => {
    console.log("Reservation table created or already existed")
}).catch((error) => {
    console.log("Error while creating Reservation table", error)
})

module.exports = Reservation
