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
    currentStatus: {
        type: DataTypes.ENUM('available', 'in_use', 'awaiting_checkin'),
        allowNull: false,
        defaultValue: 'available'
    },
    currentReservationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'MovieSeats',
    timestamps: true
})

// ลบ individual sync ออก - ใช้ sync จาก index.js แทน

module.exports = MovieSeat