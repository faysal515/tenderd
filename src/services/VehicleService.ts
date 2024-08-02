import { Service } from "typedi";
import Vehicle, { IVehicle } from "../models/Vehicle";
import { CreateVehicleDto } from "../dto/Vehicle.dto";

@Service()
export class VehicleService {
  public async addVehicle(vehicleData: CreateVehicleDto): Promise<IVehicle> {
    const vehicleDataWithDefaults = {
      ...vehicleData,
      aggregatedSensorData: null,
      lastMaintenanceRecord: null,
      usageAnalytics: null,
    };

    const vehicle = new Vehicle(vehicleDataWithDefaults);
    const savedVehicle = await vehicle.save();
    return savedVehicle.toJSON();
  }
}

export default VehicleService;
