const { DataTypes } = require('sequelize')
const sequelize = require('./db')
const MovieSeat = sequelize.define("MovieSeat", {
    movieId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
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