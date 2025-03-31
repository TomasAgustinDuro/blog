// config/database.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite", // Ruta de tu base de datos SQLite
  logging: console.log,
});


export default sequelize;
