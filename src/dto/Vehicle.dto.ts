import { IsString, IsInt, Length, Min, Max } from "class-validator";

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
