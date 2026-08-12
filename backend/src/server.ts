import express, { Router } from "express";
import { ColoredLog } from "./config/adapters/colors.adapter";
import cors from "cors";
import { corsOptions } from "./config/cors/cors";
import { globalLimiter } from "./middleware/rate-limiter.middleware";

interface ServerOptions {
  PORT: number;
  PUBLIC_PATH: string;
  ROUTES: Router;
}

export class Server {
  private app = express();

  private routes: Router;
  private publicPath: string;
  private port: number;
  private serverListener: any;

  constructor({ PORT, PUBLIC_PATH = "public", ROUTES }: ServerOptions) {
    this.port = PORT;
    this.routes = ROUTES;
    this.publicPath = this.publicPath;
  }

  start = () => {
    
    // Trust top proxy (necessary for rate limiting behind proxies like Render/Vercel)
    this.app.set("trust proxy", 1);

    // Middleware function to capture request URL information
    // this.app.use(URLInformation.printReqFullUrl);

    //CORS
    this.app.use(cors(corsOptions));

    // Apply global rate limiting ALL routes in this express app
    this.app.use(globalLimiter);

    // json-parsing middleware
    this.app.use(express.json());
    // form-encoded middleware
    this.app.use(express.urlencoded());

    // app routes
    this.app.use("/api/v1", this.routes);

    this.serverListener = this.app.listen(this.port, () => {
      ColoredLog.info("server running on PORT " + this.port);
    });

    //routes no matching any above will fall here
    this.app.use((req, res, next) => {
      res.status(404).json({ message: "Routes in: /api/v1" });
    });
  };

  stop = () => {
    this.serverListener.close();
  };
}