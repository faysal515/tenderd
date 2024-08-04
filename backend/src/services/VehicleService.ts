import { Service } from "typedi";
import mongoose, { Types } from "mongoose";
import Vehicle, { IVehicle } from "../models/Vehicle";
import MaintenanceRecord, {
  IMaintenanceRecord,
} from "../models/MaintenanceRecord";
import {
  CreateVehicleDto,
  CreateMaintenanceRecordDto,
} from "../dto/Vehicle.dto";
import LoggerService from "./LoggerService";

@Service()
export class VehicleService {
  constructor(private logger: LoggerService) {}

  public async getVehicles(): Promise<IVehicle[]> {
    try {
      const vehicles = await Vehicle.find().exec();
      this.logger.info("Vehicles retrieved successfully", {
        count: vehicles.length,
      });
      return vehicles.map((vehicle) => vehicle.toJSON());
    } catch (error) {
      this.logger.error("Error retrieving vehicles", { error });
      throw error;
    }
  }

  public async addVehicle(vehicleData: CreateVehicleDto): Promise<IVehicle> {
    const vehicleDataWithDefaults = {
      ...vehicleData,
      aggregatedSensorData: null,
      lastMaintenanceRecord: null,
      usageAnalytics: null,
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

  public async calculateUsageAnalytics(
    ecuDeviceId: string,
    aggregatedSensorData: any
  ): Promise<{ distanceTraveled: number; hoursOperated: number }> {
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

    return {
      distanceTraveled:
        previousDistanceTraveled + Math.max(distanceTraveled, 0),
      hoursOperated: previousHoursOperated + Math.max(hoursOperated, 0),
    };
  }

  public async addMaintenanceRecord(
    vehicleId: string,
    maintenanceRecordData: CreateMaintenanceRecordDto
  ): Promise<IMaintenanceRecord> {
    try {
      const objectId = new Types.ObjectId(vehicleId);
      const newRecord = new MaintenanceRecord({
        ...maintenanceRecordData,
        vehicleId: objectId,
      });
      const savedRecord = await newRecord.save();

      await Vehicle.updateOne(
        { _id: objectId },
        { $set: { lastMaintenanceRecord: maintenanceRecordData } }
      );

      this.logger.info("Maintenance record added successfully", {
        recordId: savedRecord._id,
      });
      return savedRecord.toJSON();
    } catch (error) {
      this.logger.error("Error adding maintenance record", { error });
      throw error;
    }
  }

  public async getMaintenanceRecords(
    vehicleId: string
  ): Promise<IMaintenanceRecord[]> {
    try {
      const objectId = new Types.ObjectId(vehicleId);
      const records = await MaintenanceRecord.find({
        vehicleId: objectId,
      }).exec();
      this.logger.info("Maintenance records retrieved successfully", {
        vehicleId,
        count: records.length,
      });
      return records.map((record) => record.toJSON());
    } catch (error) {
      this.logger.error("Error retrieving maintenance records", { error });
      throw error;
    }
  }

  public async getVehicleStatus(vehicleId: string): Promise<IVehicle | null> {
    try {
      const objectId = new Types.ObjectId(vehicleId);
      const vehicle = await Vehicle.findById(objectId).exec();
      return vehicle ? vehicle.toJSON() : null;
    } catch (error) {
      this.logger.error("Error retrieving vehicle status", { error });
      throw error;
    }
  }

  public async getVehicleStatusByEcuId(
    ecuDeviceId: string
  ): Promise<IVehicle | null> {
    try {
      const vehicle = await Vehicle.findOne({ ecuDeviceId }).exec();
      return vehicle ? vehicle.toJSON() : null;
    } catch (error) {
      this.logger.error("Error retrieving vehicle status by ECU ID", { error });
      throw error;
    }
  }
}

export default VehicleService;
