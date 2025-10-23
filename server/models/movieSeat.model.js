const { DataTypes } = require('sequelize')
const sequelize = require('./db')
const MovieSeat = sequelize.define("MovieSeat", {
    movieId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: 'เปิด/ปิดการให้บริการที่นั่ง (true = เปิด, false = ปิด)'
    },
    currentStatus: {
        type: DataTypes.ENUM('available', 'in_use', 'awaiting_checkin'),
        allowNull: false,
        defaultValue: 'available',
        comment: 'สถานะการใช้งานปัจจุบัน (available = ว่าง, in_use = กำลังใช้งาน, awaiting_checkin = รอ check-in)'
    },
    currentReservationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID ของการจองปัจจุบัน (null = ว่าง)'
    }
}, {
    tableName: 'MovieSeats',
    timestamps: true
})

MovieSeat.sync({ force: false }).then(() => {
    console.log("table created or already existed")
}).catch((error) => {
    console.log("error while creating MovieSeat table", error)
})

module.exports = MovieSeat