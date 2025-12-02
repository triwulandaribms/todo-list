import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: (process.env.DB_DIALECT as any) || "postgres",
    logging: false, 
  }
);

export async function database(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Terhubung ke database");
    await sequelize.sync();
  } catch (err) {
    console.error("Failed to connect database:", (err as Error).message);
    process.exit(1);
  }
}
