const { DataTypes } = require('sequelize')
const sequelize = require('./db')
const KaraokeRoom = sequelize.define("KaraokeRoom", {
    karaokeId: {
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
})

KaraokeRoom.sync({ force: false }).then(() => {
    console.log("table created or already existed")
}).catch((error) => {
    console.log("error while creating KaraokeRoom table", error)
})

module.exports = KaraokeRoom