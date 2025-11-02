import express from "express";
import { Express } from "express";
import serverConfig from "./config/index";
import V1Router from "./routers/v1/index.router";
import { genericErrorHandler } from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { testConnection } from "./prisma/client";
import { setupRoomGererationWorker } from "./processors/roomGernation.processors";
import { startScheduler } from "./scheduler/roomScheduler";

// const app = express(); // implicit
const app: Express = express(); // explcit

// const port: number = 3000;
app.use(express.json());

app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", V1Router);

app.use(genericErrorHandler);

const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      logger.error("Database connection failed. Server will not start.");
      process.exit(1);
    }

    app.listen(serverConfig.PORT, () => {
      logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
      logger.info(`Press Ctrl+C to exit`, { server: "dev server" });
       setupRoomGererationWorker();
       startScheduler();
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
