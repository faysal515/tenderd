import { JsonController, Post, Body, Res } from "routing-controllers";
import { Response } from "express";
import { VehicleService } from "../services/VehicleService";
import { IVehicle } from "../models/Vehicle";
import { Service, Inject } from "typedi";
import LoggerService from "../services/LoggerService";
import { CreateVehicleDto } from "../dto/Vehicle.dto";

@JsonController("/vehicles")
@Service()
export class VehicleController {
  constructor(
    @Inject() private vehicleService: VehicleService,
    @Inject() private logger: LoggerService
  ) {}

  @Post()
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
}
