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
      odometerReading: { type: Number, default: 0, required: false },
      engineHours: { type: Number, default: 0, required: false },
      fuelLevel: { type: String, default: "Full", required: false },
      lastGpsLocation: {
        latitude: { type: Number, default: 0, required: false },
        longitude: { type: Number, default: 0, required: false },
      },
      timestamp: { type: Date, default: Date.now, required: false },
    },
    lastMaintenanceRecord: {
      date: { type: Date, default: Date.now, required: false },
      description: { type: String, default: "", required: false },
      cost: { type: Number, default: 0, required: false },
    },
    usageAnalytics: {
      hoursOperated: { type: Number, default: 0, required: false },
      distanceTraveled: { type: Number, default: 0, required: false },
    },
  },
  {
    toJSON: {
      virtuals: true, // Include virtuals when document is converted to JSON
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Convert ObjectId to string
        delete ret._id; // Remove the _id property
        // delete ret.__v; // Optionally remove the version key
        return ret;
      },
    },
  }
);

const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export default Vehicle;
