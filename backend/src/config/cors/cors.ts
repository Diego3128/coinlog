import { CorsOptions } from "cors";
import { environments } from "../envs/envs";

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {

    const whiteList = [environments.FRONTED_URL];
    const apiTest = process.argv.includes("--api");
    // console.log({whiteList, apiTest});

    //let pass valid origins or when the execution command includes the '--api' flag. it means development (useful for tools like postman)
    if (whiteList.includes(requestOrigin) || apiTest) {
      callback(null, true);
    } else {
      callback(new Error(`Invalid origin '${requestOrigin}'`));
    }
  },
};