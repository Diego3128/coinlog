import { config } from "dotenv";
import { get } from "env-var"
import { ColoredLog } from "../adapters/colors.adapter";

config({ quiet: true }); 

export const environments = {
    PROD: get("PROD").required().asBool(),
    PORT: get("PORT").required().asPortNumber(),
    FRONTED_URL: get("FRONTED_URL").required().asString(),
    POSTGRE_DB_HOST: get("POSTGRE_DB_HOST").required().asString(),
    POSTGRE_DB_USER: get("POSTGRE_DB_USER").required().asString(),
    POSTGRE_DB_NAME: get("POSTGRE_DB_NAME").required().asString(),
    POSTGRE_DB_PASSWORD: get("POSTGRE_DB_PASSWORD").required().asString(),
    POSTGRE_DB_PORT: get("POSTGRE_DB_PORT").required().asPortNumber(),
    MAILTRAP_API_TOKEN: get("MAILTRAP_API_TOKEN").required().asString(),
    TEST_INBOX_ID: get("TEST_INBOX_ID").required().asIntPositive(),
    EMAIL_DOMAIN: get("EMAIL_DOMAIN").required().asString(),
    JWT_SECRET: get("JWT_SECRET").required().asString(),
    REFRESH_SECRET: get("REFRESH_SECRET").required().asString(),
    // DB_NAME: get("DB_NAME").required().asString(),
    // CLOUDINARY_CLOUD_NAME: get("CLOUDINARY_CLOUD_NAME").required().asString(),
    // CLOUDINARY_API_KEY: get("CLOUDINARY_API_KEY").required().asString(),
    // CLOUDINARY_API_SECRET: get("CLOUDINARY_API_SECRET").required().asString(),

};
if (!environments.PROD) {
    ColoredLog.info(JSON.stringify(environments));
}
//NO NEED FOR SINGLETON