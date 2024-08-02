import { Service } from "typedi";
import Vehicle, { IVehicle } from "../models/Vehicle";
import { CreateVehicleDto } from "../dto/Vehicle.dto";
import LoggerService from "./LoggerService";

@Service()
export class VehicleService {
  constructor(private logger: LoggerService) {}

  public async addVehicle(vehicleData: CreateVehicleDto): Promise<IVehicle> {
    const vehicleDataWithDefaults = {
      ...vehicleData,
      aggregatedSensorData: null,
      lastMaintenanceRecord: null,
      usageAnalytics: {
        hoursOperated: 0,
        distanceTraveled: 0,
      },
    };

    try {
      const vehicle = new Vehicle(vehicleDataWithDefaults);
      const savedVehicle = await vehicle.save();
      this.logger.info("Vehicle added successfully", {
        vehicleId: savedVehicle._id,
      });
      return savedVehicle.toJSON();
    } catch (error) {
      this.logger.error("Error adding vehicle", { error });
      throw error;
    }
  }

  public async updateVehicleData(sensorData: any): Promise<void> {
    const { ecuDeviceId, aggregatedSensorData } = sensorData;
    const usageAnalytics = await this.calculateUsageAnalytics(
      ecuDeviceId,
      aggregatedSensorData
    );

    const update = {
      $set: {
        aggregatedSensorData,
        usageAnalytics,
      },
    };

    try {
      await Vehicle.updateOne({ ecuDeviceId }, update);
      this.logger.info("Vehicle data updated successfully", { ecuDeviceId });
    } catch (error) {
      this.logger.error("Failed to update vehicle data", {
        ecuDeviceId,
        error,
      });
      throw error;
    }
  }

  private async calculateUsageAnalytics(
    ecuDeviceId: string,
    aggregatedSensorData: any
  ) {
    const vehicle = await Vehicle.findOne({ ecuDeviceId });

    if (!vehicle) {
      throw new Error(`Vehicle with ECU Device ID: ${ecuDeviceId} not found`);
    }

    const previousOdometerReading =
      vehicle.aggregatedSensorData?.odometerReading ?? 0;
    const previousEngineHours = vehicle.aggregatedSensorData?.engineHours ?? 0;

    const newOdometerReading = aggregatedSensorData.odometerReading ?? 0;
    const newEngineHours = aggregatedSensorData.engineHours ?? 0;

    const distanceTraveled = newOdometerReading - previousOdometerReading;
    const hoursOperated = newEngineHours - previousEngineHours;

    const previousDistanceTraveled =
      vehicle.usageAnalytics?.distanceTraveled ?? 0;
    const previousHoursOperated = vehicle.usageAnalytics?.hoursOperated ?? 0;

    // Debugging logs
    console.log("previousOdometerReading:", previousOdometerReading);
    console.log("previousEngineHours:", previousEngineHours);
    console.log("newOdometerReading:", newOdometerReading);
    console.log("newEngineHours:", newEngineHours);
    console.log("distanceTraveled:", distanceTraveled);
    console.log("hoursOperated:", hoursOperated);
    console.log("previousDistanceTraveled:", previousDistanceTraveled);
    console.log("previousHoursOperated:", previousHoursOperated);

    return {
      distanceTraveled:
        previousDistanceTraveled + Math.max(distanceTraveled, 0),
      hoursOperated: previousHoursOperated + Math.max(hoursOperated, 0),
    };
  }
}

export default VehicleService;
