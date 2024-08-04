import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  make: string;
  vehicleModel: string;
  year: number;
  ecuDeviceId: string;
  aggregatedSensorData?: {
    odometerReading?: number;
    engineHours?: number;
    fuelLevel?: string;
    lastGpsLocation?: {
      latitude?: number;
      longitude?: number;
    };
    timestamp?: Date;
  };
  lastMaintenanceRecord?: {
    date?: Date;
    description?: string;
    cost?: number;
  };
  usageAnalytics?: {
    hoursOperated?: number;
    distanceTraveled?: number;
  };
}

const VehicleSchema: Schema = new Schema(
  {
    make: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    year: { type: Number, required: true },
    ecuDeviceId: { type: String, required: true, unique: true },
    aggregatedSensorData: {
      odometerReading: { type: Number, default: 0 },
      engineHours: { type: Number, default: 0 },
      fuelLevel: { type: String, default: "Full" },
      lastGpsLocation: {
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
      timestamp: { type: Date, default: Date.now },
    },
    lastMaintenanceRecord: {
      date: { type: Date, default: Date.now },
      description: { type: String, default: "" },
      cost: { type: Number, default: 0 },
    },
    usageAnalytics: {
      hoursOperated: { type: Number, default: 0 },
      distanceTraveled: { type: Number, default: 0 },
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export default Vehicle;
