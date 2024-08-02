import { Service } from "typedi";
import { KafkaClient } from "./KafkaClient";
import { VehicleService } from "./VehicleService";
import LoggerService from "./LoggerService";

@Service()
export class VehicleSensorUpdateService {
  constructor(
    private kafkaClient: KafkaClient,
    private vehicleService: VehicleService,
    private logger: LoggerService
  ) {}

  public async startConsuming() {
    await this.kafkaClient.connectConsumer();
    await this.kafkaClient.consumeMessages(async (message) => {
      try {
        const sensorData = JSON.parse(message.value.toString());
        this.logger.info("Received sensor data", { sensorData });

        // Update vehicle data in MongoDB
        await this.vehicleService.updateVehicleData(sensorData);
      } catch (error) {
        this.logger.error("Error processing message", { error });
      }
    });
  }
}

export default VehicleSensorUpdateService;
