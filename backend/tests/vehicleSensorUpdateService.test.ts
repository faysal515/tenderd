import { VehicleSensorUpdateService } from "../src/services/VehicleSensorUpdateService";
import { KafkaClient } from "../src/services/KafkaClient";
import { VehicleService } from "../src/services/VehicleService";
import LoggerService from "../src/services/LoggerService";
import { Kafka } from "kafkajs";

jest.mock("kafkajs");

describe("VehicleSensorUpdateService", () => {
  let vehicleSensorUpdateService: VehicleSensorUpdateService;
  let kafkaClient: KafkaClient;
  let vehicleService: VehicleService;
  let loggerService: LoggerService;

  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  const mockSend = jest.fn();
  const mockSubscribe = jest.fn();
  const mockRun = jest.fn();

  beforeEach(() => {
    (Kafka as any).mockImplementation(() => ({
      producer: () => ({
        connect: mockConnect,
        disconnect: mockDisconnect,
        send: mockSend,
      }),
      consumer: () => ({
        connect: mockConnect,
        disconnect: mockDisconnect,
        subscribe: mockSubscribe,
        run: mockRun,
      }),
    }));

    kafkaClient = new KafkaClient();
    vehicleService = new VehicleService(new LoggerService());
    loggerService = new LoggerService();
    vehicleSensorUpdateService = new VehicleSensorUpdateService(
      kafkaClient,
      vehicleService,
      loggerService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should start consuming messages", async () => {
    mockRun.mockImplementation(({ eachMessage }) => {
      eachMessage({
        topic: "test-topic",
        partition: 0,
        message: {
          key: null,
          value: Buffer.from(
            JSON.stringify({
              ecuDeviceId: "device-001",
              aggregatedSensorData: {},
            })
          ),
        },
      });
    });

    const updateVehicleDataSpy = jest
      .spyOn(vehicleService, "updateVehicleData")
      .mockResolvedValue();

    await vehicleSensorUpdateService.startConsuming();

    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(updateVehicleDataSpy).toHaveBeenCalledWith({
      ecuDeviceId: "device-001",
      aggregatedSensorData: {},
    });
  });
});
