import "reflect-metadata";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { getFromContainer, MetadataStorage } from "class-validator";
import {
  CreateVehicleDto,
  CreateMaintenanceRecordDto,
} from "./dto/Vehicle.dto";

// Explicitly reference the DTOs
const dtos = [CreateVehicleDto, CreateMaintenanceRecordDto];
dtos.forEach((dto) => new dto()); // This ensures the metadata is registered

// Generate schemas
const schemas = validationMetadatasToSchemas({
  classValidatorMetadataStorage: getFromContainer(MetadataStorage),
});

// Export all schemas
export const allSchemas = schemas;

console.log("Generated schemas:", allSchemas);
