const moment = require('moment-timezone')

// ตั้งค่า timezone เป็น Asia/Bangkok
const TIMEZONE = 'Asia/Bangkok'

// ดึงเวลาปัจจุบันตาม timezone Bangkok
const getBangkokTime = () => {
    return moment.tz(TIMEZONE)
}

// แปลง Date object เป็น moment ตาม timezone Bangkok
const toBangkokTime = (date) => {
    return moment(date).tz(TIMEZONE)
}

// ดึงวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
const getTodayDate = () => {
    return getBangkokTime().format('YYYY-MM-DD')
}

// ดึงเวลาปัจจุบันในรูปแบบ HH:mm
const getCurrentTime = () => {
    return getBangkokTime().format('HH:mm')
}

// ดึงชั่วโมงปัจจุบัน (0-23)
const getCurrentHour = () => {
    return getBangkokTime().hour()
}

// ตรวจสอบว่าเลยเวลาที่กำหนดแล้วหรือไม่
const isAfterTime = (hour, minute = 0) => {
    const now = getBangkokTime()
    const targetTime = moment.tz(TIMEZONE).hour(hour).minute(minute).second(0)
    return now.isAfter(targetTime)
}

// คำนวณเวลาที่จะหมดอายุ (เพิ่มนาที)
const addMinutes = (date, minutes) => {
    return moment(date).tz(TIMEZONE).add(minutes, 'minutes').toDate()
}

// ตรวจสอบว่าหมดเวลาแล้วหรือไม่
const isExpired = (expiryDate) => {
    const now = getBangkokTime()
    return now.isAfter(moment(expiryDate).tz(TIMEZONE))
}

module.exports = {
    TIMEZONE,
    getBangkokTime,
    toBangkokTime,
    getTodayDate,
    getCurrentTime,
    getCurrentHour,
    isAfterTime,
    addMinutes,
    isExpired
}
