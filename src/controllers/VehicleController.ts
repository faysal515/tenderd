import {
  JsonController,
  Post,
  Body,
  Res,
  Param,
  Get,
  Req,
  OnUndefined,
} from "routing-controllers";
import { Response, Request } from "express";
import { VehicleService } from "../services/VehicleService";
import { IVehicle } from "../models/Vehicle";
import { IMaintenanceRecord } from "../models/MaintenanceRecord";
import { Service, Inject } from "typedi";
import LoggerService from "../services/LoggerService";
import {
  CreateVehicleDto,
  CreateMaintenanceRecordDto,
} from "../dto/Vehicle.dto";
import { VehicleSensorUpdateService } from "../services/VehicleSensorUpdateService";
import { OpenAPI } from "routing-controllers-openapi";

@JsonController("/vehicles")
@Service()
export class VehicleController {
  constructor(
    @Inject() private vehicleService: VehicleService,
    @Inject() private logger: LoggerService,
    @Inject() private vehicleSensorUpdateService: VehicleSensorUpdateService
  ) {}

  @Post()
  @OpenAPI({ summary: "Create a new vehicle" })
  async createVehicle(
    @Res() res: Response,
    @Body({ validate: true }) vehicleData: CreateVehicleDto
  ): Promise<IVehicle> {
    this.logger.info("Creating new vehicle", { data: vehicleData });
    const newVehicle = await this.vehicleService.addVehicle(vehicleData);
    this.logger.info("Vehicle created successfully", {
      id: newVehicle._id,
      requestId: res.locals.requestId,
    });
    return newVehicle;
  }

  @Post("/:vehicleId/maintenance")
  @OpenAPI({ summary: "Add maintenance record to a vehicle" })
  async addMaintenanceRecord(
    @Param("vehicleId") vehicleId: string,
    @Body({ validate: true }) maintenanceRecordData: CreateMaintenanceRecordDto,
    @Res() res: Response
  ): Promise<IMaintenanceRecord> {
    this.logger.info("Adding maintenance record", {
      vehicleId,
      data: maintenanceRecordData,
    });
    const maintenanceRecord = await this.vehicleService.addMaintenanceRecord(
      vehicleId,
      maintenanceRecordData
    );
    this.logger.info("Maintenance record added successfully", {
      recordId: maintenanceRecord._id,
      requestId: res.locals.requestId,
    });
    return maintenanceRecord;
  }

  @Get("/:vehicleId/maintenance")
  @OpenAPI({ summary: "Get maintenance records of a vehicle" })
  async getMaintenanceRecords(
    @Param("vehicleId") vehicleId: string,
    @Res() res: Response
  ): Promise<IMaintenanceRecord[]> {
    this.logger.info("Fetching maintenance records", {
      vehicleId,
      requestId: res.locals.requestId,
    });
    const records = await this.vehicleService.getMaintenanceRecords(vehicleId);
    this.logger.info("Maintenance records fetched successfully", {
      vehicleId,
      count: records.length,
      requestId: res.locals.requestId,
    });
    return records;
  }

  @Get("/:vehicleId/status")
  @OnUndefined(200)
  @OpenAPI({ summary: "Get real-time status of a vehicle" })
  async getVehicleStatus(
    @Param("vehicleId") vehicleId: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    console.log("SSE connection opened for vehicle:", vehicleId);

    try {
      // Set headers for SSE
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      res.write("event: connected\ndata: Connection established\n\n");

      const sendStatus = (status: any) => {
        console.log("Sending status for vehicle:", vehicleId, status);
        res.write(`event: status\ndata: ${JSON.stringify(status)}\n\n`);
      };

      const vehicle = await this.vehicleService.getVehicleStatus(vehicleId);
      if (!vehicle) {
        console.log("Vehicle not found:", vehicleId);
        sendStatus({ error: "Vehicle not found" });
        res.end(); // End the response if vehicle is not found
        return;
      }

      const ecuDeviceId = vehicle.ecuDeviceId;
      console.log("Initial status send for ecuDeviceId:", ecuDeviceId);
      sendStatus(vehicle.aggregatedSensorData);

      const statusUpdateListener = (status: any) => {
        console.log("Status update received for ecuDeviceId:", ecuDeviceId);
        sendStatus(status);
      };

      this.vehicleSensorUpdateService.onVehicleStatusUpdate(
        ecuDeviceId,
        statusUpdateListener
      );

      req.on("close", () => {
        console.log("Client closed connection for ecuDeviceId:", ecuDeviceId);
        this.vehicleSensorUpdateService.offVehicleStatusUpdate(
          ecuDeviceId,
          statusUpdateListener
        );
      });

      await new Promise(() => {});
    } catch (error) {
      console.error("Error in getVehicleStatus:", error);
      this.logger.error("Error in getVehicleStatus", {
        error,
        requestId: res.locals.requestId,
      });
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }
  }
}
