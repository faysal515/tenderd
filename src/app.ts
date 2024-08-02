import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { useExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import mongoose from "mongoose";
import { VehicleController } from "./controllers/VehicleController";
import { AddRequestIdMiddleware } from "./middlewares/AddRequestIdMiddleware";
import { ErrorHandler } from "./middlewares/ErrorMiddleware";
import { SensorSimulatorService } from "./services/SensorSimulatorService";
import { KafkaClient } from "./services/KafkaClient";
import env from "./env";

// Set up TypeDI as the container for routing-controllers
useContainer(Container);

const app = express();
const port = env.PORT;

useExpressServer(app, {
  defaultErrorHandler: false,
  controllers: [VehicleController],
  middlewares: [AddRequestIdMiddleware, ErrorHandler],
});

const connectToMongoDB = async () => {
  const mongoUri = env.MONGO_URI || "mongodb://localhost:27017/tenderd";
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const startKafkaProducer = async () => {
  const kafkaClient = Container.get(KafkaClient);
  try {
    await kafkaClient.connectProducer();
    console.log("Connected to Kafka");
    const sensorSimulatorService = Container.get(SensorSimulatorService);
    sensorSimulatorService.startSimulation();
  } catch (error) {
    console.error("Error connecting to Kafka:", error);
    process.exit(1);
  }
};

const startServer = () => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

const init = async () => {
  await connectToMongoDB();
  if (env.RUN_SIMULATION) {
    await startKafkaProducer();
  }
  startServer();
  console.log("======= ", env);
};

if (require.main === module) {
  init();
}

process.on("SIGINT", async () => {
  const kafkaClient = Container.get(KafkaClient);
  await kafkaClient.disconnectProducer();
  process.exit(0);
});

export { app };
