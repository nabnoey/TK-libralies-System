const { DataTypes } = require('sequelize')
const sequelize = require('./db')

const Reservation = sequelize.define("Reservation", {
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
        defaultValue: DataTypes.NOW,
        comment: 'Date of reservation (without time) - defaults to today'
    },
    numberOfPeople: {
        type: DataTypes.VIRTUAL,
        get() {
            // คำนวณจาก friendEmails.length + 1 (ผู้จอง)
            const friendEmails = this.getDataValue('friendEmails') || []
            return friendEmails.length + 1
        },
        comment: 'Number of people in the reservation (auto-calculated from friendEmails + 1)'
    },
    friendEmails: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        validate: {
            isValidLength(value) {
                const totalPeople = value.length + 1 // +1 for the user who books
                if (totalPeople < 4 || totalPeople > 6) {
                    throw new Error('จำนวนคนทั้งหมด (รวมคุณ) ต้องอยู่ระหว่าง 4-6 คน (ระบุ email เพื่อน 3-5 คน)')
                }
            }
        },
        comment: 'Array of friend emails (must be registered users, need 3-5 friends)'
    },
    timeSlot: {
        type: DataTypes.STRING,
        allowNull: true, // สำหรับ movie เท่านั้น, karaoke ไม่ต้องใช้
        comment: 'Time slot for movie reservation only (1-hour slots: "09:00-10:00", "10:00-11:00", ..., "15:00-16:00")',
        validate: {
            isValidTimeSlot(value) {
                // ถ้าเป็น null หรือ undefined ให้ผ่าน (สำหรับ karaoke)
                if (!value) return

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
    queueNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Queue number for karaoke reservations (1 = currently using, 2+ = waiting in queue)'
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the user started using the karaoke room (only for karaoke)'
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the user finished using the karaoke room (only for karaoke)'
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
