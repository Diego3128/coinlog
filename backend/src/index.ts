import { environments } from "./config/envs/envs";
import { AppRoutes } from "./routes";
import { Server } from "./server";

import { connectoToDB } from "./config/db";

const { PORT } = environments;

(async () => {

    try {

        await connectoToDB();

        const server: Server = new Server({
            PORT,
            PUBLIC_PATH: 'public',
            ROUTES: AppRoutes.routes
        });

        server.start();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

})();