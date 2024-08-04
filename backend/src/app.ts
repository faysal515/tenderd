import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { useExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import mongoose from "mongoose";
import { VehicleController } from "./controllers/VehicleController";
import { AddRequestIdMiddleware } from "./middlewares/AddRequestIdMiddleware";
import { ErrorHandler } from "./middlewares/ErrorMiddleware";
import { SensorSimulatorService } from "./services/SensorSimulatorService";
import { KafkaClient } from "./services/KafkaClient";
import { VehicleSensorUpdateService } from "./services/VehicleSensorUpdateService";
import env from "./env";
import { setupSwagger } from "./swagger";

useContainer(Container);

const app = express();
const port = env.PORT;

app.use(cors());

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

const startKafkaConsumer = async () => {
  const vehicleSensorUpdateService = Container.get(VehicleSensorUpdateService);
  try {
    await vehicleSensorUpdateService.startConsuming();
    console.log("Kafka consumer started");
  } catch (error) {
    console.error("Error starting Kafka consumer:", error);
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
  await startKafkaConsumer();
  if (env.RUN_SIMULATION) {
    await startKafkaProducer();
  }
  setupSwagger(app);
  startServer();
  console.log("Safe to interact now with backend server");
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
