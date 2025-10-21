const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const User = sequelize.define("User", {
  userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  provider: { type: DataTypes.STRING, defaultValue: "google" },
  providerId: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "user" },
  lastLoginAt: { type: DataTypes.DATE },
}, {
  tableName: "users",
  timestamps: true,
});

User.sync({ force: false }).then(() => {
    console.log("table created or already existed")
}).catch((error) => {
    console.log("error while creating User table", error)
})

module.exports = User;
