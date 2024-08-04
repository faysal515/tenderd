import { VehicleService } from "../src/services/VehicleService";
import Vehicle from "../src/models/Vehicle";
import LoggerService from "../src/services/LoggerService";

// Mock the Vehicle model
jest.mock("../src/models/Vehicle");

describe("VehicleService", () => {
  let vehicleService: VehicleService;
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = new LoggerService();
    vehicleService = new VehicleService(loggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateUsageAnalytics", () => {
    it("should correctly calculate usage analytics", async () => {
      const mockVehicle = {
        aggregatedSensorData: {
          odometerReading: 1000,
          engineHours: 50,
        },
        usageAnalytics: {
          distanceTraveled: 1000,
          hoursOperated: 50,
        },
      };

      (Vehicle.findOne as jest.Mock).mockResolvedValue(mockVehicle);

      const ecuDeviceId = "device-001";
      const aggregatedSensorData = {
        odometerReading: 1500,
        engineHours: 70,
      };

      const result = await vehicleService.calculateUsageAnalytics(
        ecuDeviceId,
        aggregatedSensorData
      );

      expect(result).toEqual({
        distanceTraveled: 1500,
        hoursOperated: 70,
      });
    });

    it("should throw an error if vehicle not found", async () => {
      (Vehicle.findOne as jest.Mock).mockResolvedValue(null);

      const ecuDeviceId = "device-002";
      const aggregatedSensorData = {
        odometerReading: 1500,
        engineHours: 70,
      };

      await expect(
        vehicleService.calculateUsageAnalytics(
          ecuDeviceId,
          aggregatedSensorData
        )
      ).rejects.toThrow(`Vehicle with ECU Device ID: ${ecuDeviceId} not found`);
    });
  });
});
