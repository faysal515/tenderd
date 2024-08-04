const env = {
  PORT: process.env.PORT || 3000,
  RUN_SIMULATION: process.env.RUN_SIMULATION == "true",
  MONGO_URI: process.env.MONGO_URI,
  kafka: {
    VEHICLE_SENSOR_TOPIC: "vehicle-sensor-data",
    KAFKA_BROKER: process.env.KAFKA_BROKER || "localhost:9092",
    KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || "sensor-simulator",
  },
};

// console.log("-----", env);

export default env;
