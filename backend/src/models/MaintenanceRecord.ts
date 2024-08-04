import mongoose, { Schema, Document } from "mongoose";

export interface IMaintenanceRecord extends Document {
  vehicleId: string;
  date: Date;
  description: string;
  cost: number;
}

const MaintenanceRecordSchema: Schema = new Schema(
  {
    vehicleId: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    cost: { type: Number, required: true },
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

const MaintenanceRecord = mongoose.model<IMaintenanceRecord>(
  "MaintenanceRecord",
  MaintenanceRecordSchema
);
export default MaintenanceRecord;
