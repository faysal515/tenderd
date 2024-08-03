import { Service } from "typedi";
import { EventEmitter } from "events";
import { KafkaClient } from "./KafkaClient";
import { VehicleService } from "./VehicleService";
import LoggerService from "./LoggerService";

@Service()
export class VehicleSensorUpdateService {
  private events = new EventEmitter();

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

        await this.vehicleService.updateVehicleData(sensorData);

        const updatedVehicleStatus =
          await this.vehicleService.getVehicleStatusByEcuId(
            sensorData.ecuDeviceId
          );

        const eventKey = `status-update-${sensorData.ecuDeviceId}`;
        this.events.emit(eventKey, updatedVehicleStatus?.aggregatedSensorData);
        this.logger.info("Event emitter working ", { eventKey });
      } catch (error) {
        this.logger.error("Error processing message", { error });
      }
    });
  }

  public onVehicleStatusUpdate(
    ecuDeviceId: string,
    listener: (status: any) => void
  ) {
    console.log("Registering listener for ecuDeviceId:", ecuDeviceId);
    this.events.on(`status-update-${ecuDeviceId}`, listener);
  }

  public offVehicleStatusUpdate(
    ecuDeviceId: string,
    listener: (status: any) => void
  ) {
    console.log("Removing listener for ecuDeviceId:", ecuDeviceId);
    this.events.off(`status-update-${ecuDeviceId}`, listener);
  }
}

export default VehicleSensorUpdateService;
