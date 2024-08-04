import { Service } from "typedi";
import { KafkaClient } from "./KafkaClient";
import env from "../env";

@Service()
export class SensorSimulatorService {
  private vehicles = [
    {
      ecuDeviceId: "device-001",
      latitude: 37.7749,
      longitude: -122.4194,
      odometerReading: 10000,
      engineHours: 500,
      fuelLevel: "Full",
    },
    // Add more vehicle data as needed
  ];

  constructor(private kafkaClient: KafkaClient) {}

  private getRandomChange(value: number, range: number) {
    return value + (Math.random() * range * 2 - range);
  }

  private generateSensorData(vehicle: any) {
    vehicle.latitude = this.getRandomChange(vehicle.latitude, 0.0001);
    vehicle.longitude = this.getRandomChange(vehicle.longitude, 0.0001);
    vehicle.odometerReading += Math.random() * 10; // Simulate driving distance
    vehicle.engineHours += 0.1; // Simulate engine hours
    vehicle.fuelLevel = Math.random() > 0.5 ? "Full" : "Half"; // Randomly change fuel level

    return {
      ecuDeviceId: vehicle.ecuDeviceId,
      aggregatedSensorData: {
        odometerReading: vehicle.odometerReading,
        engineHours: vehicle.engineHours,
        fuelLevel: vehicle.fuelLevel,
        lastGpsLocation: {
          latitude: vehicle.latitude,
          longitude: vehicle.longitude,
        },
        timestamp: new Date(),
      },
    };
  }

  public async startSimulation() {
    console.log("Starting sensor data simulation...");
    setInterval(async () => {
      for (const vehicle of this.vehicles) {
        const sensorData = this.generateSensorData(vehicle);
        await this.kafkaClient.sendSensorData(env.kafka.VEHICLE_SENSOR_TOPIC, [
          { key: sensorData.ecuDeviceId, value: JSON.stringify(sensorData) },
        ]);
        console.log("Published sensor data:", sensorData);
      }
    }, 5000);
  }
}
