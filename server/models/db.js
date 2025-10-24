const { Sequelize } = require("sequelize")
const dbConfig = require('../config/db.config')

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.DIALECT,
    logging: false,
    omitNull: true,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // ไม่แนะนำใน production
        },
        connectTimeout: 60000 // เพิ่ม timeout เป็น 60 วินาที
    },
})

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully!")
    }catch(error) {
        console.log("Unable to connect to the database!", error)
    }
}

// ไม่เรียก connection() ทันที ให้ index.js เรียกเองผ่าน sync
// connection()

module.exports = sequelize