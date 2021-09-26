import bodyParser from "body-parser";
import Controller from "controller.interface";
import express from "express";
import { logger } from "./utils";
import AccountController from "./account.controller";
import CoinController from "./coin.controller";
import MangoSimpleClient from "./mango.simple.client";
import MarketsController from "./markets.controller";
import OrdersController from "./orders.controller";
import WalletController from "./wallet.controller";

class App {
  public app: express.Application;
  public mangoSimpleClient: MangoSimpleClient;

  constructor() {
    this.app = express();
    MangoSimpleClient.create()
      .then((mangoSimpleClient) => {
        this.mangoSimpleClient = mangoSimpleClient;

        this.app.use(bodyParser.json({ limit: "50mb" }));

        this.initializeControllers([
          new CoinController(this.mangoSimpleClient),
          new WalletController(this.mangoSimpleClient),
          new OrdersController(this.mangoSimpleClient),
          new MarketsController(this.mangoSimpleClient),
          new AccountController(this.mangoSimpleClient),
        ]);
      })
      .catch((error) => {
        logger.error(
          `Error initializing mango simple client - ${error.message}`
        );
        process.exit(1);
      });
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  public listen() {
    const port = process.env.PORT || 3000;
    this.app.listen(port);
    logger.info(`App listening on port ${port}`);
  }

  public getServer() {
    return this.app;
  }
}

export default App;
