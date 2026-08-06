import { Sequelize } from "sequelize-typescript";

import { environments } from "../envs/envs";
import { ColoredLog } from "../adapters/colors.adapter";

const { POSTGRE_DB_HOST, POSTGRE_DB_USER, POSTGRE_DB_PORT, POSTGRE_DB_NAME, POSTGRE_DB_PASSWORD, PROD } = environments;

const sequelize = new Sequelize({
    host: POSTGRE_DB_HOST,
    username: POSTGRE_DB_USER,
    database: POSTGRE_DB_NAME,
    port: POSTGRE_DB_PORT,
    password: POSTGRE_DB_PASSWORD,
    logging: !PROD ? ColoredLog.info : false,
    dialect: "postgres",
    models: [__dirname + "/../../models/**/*"],
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});


export const connectoToDB = async () => {
    try {
        await sequelize.authenticate();
        if(!PROD){
            ColoredLog.warn("Syncronizing changes to database")
            sequelize.sync(); //auto syncs models to db // if not,  use cli instead?
        }
        ColoredLog.success("Database connection established");
    } catch (error) {
        ColoredLog.error("Error connecting to database");
        throw error;
    }
}

export default sequelize;