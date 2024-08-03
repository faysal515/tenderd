import {
  IsString,
  IsInt,
  Length,
  Min,
  Max,
  IsDate,
  IsNumber,
} from "class-validator";

import { Type } from "class-transformer";

export class CreateVehicleDto {
  @IsString()
  @Length(2, 50)
  public make: string;

  @IsString()
  @Length(2, 50)
  public vehicleModel: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  public year: number;

  @IsString()
  @Length(5, 50)
  public ecuDeviceId: string;
}

export class CreateMaintenanceRecordDto {
  @IsString()
  public description: string;

  @IsDate()
  @Type(() => Date)
  public date: Date;

  @IsNumber()
  public cost: number;
}
