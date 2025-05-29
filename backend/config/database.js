// config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: true, // Neon requiere SSL
  },
  protocol: "postgres",
  logging: false,
});

export default sequelize;
