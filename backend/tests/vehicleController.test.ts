import request from "supertest";
import { app } from "../src/app"; // Adjust the path according to your project structure
import mongoose from "mongoose";
import Vehicle from "../src/models/Vehicle";

describe("VehicleController", () => {
  beforeAll(async () => {
    // Connect to a test database
    const mongoUri = "mongodb://localhost:27017/tenderd-test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up the database and close the connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up the database between tests
    await Vehicle.deleteMany({});
  });

  it("should create a new vehicle", async () => {
    const response = await request(app)
      .post("/vehicles")
      .send({
        make: "Toyota",
        vehicleModel: "Corolla",
        year: 2020,
        ecuDeviceId: "device-001",
      })
      .expect(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body.make).toBe("Toyota");
    expect(response.body.vehicleModel).toBe("Corolla");
    expect(response.body.year).toBe(2020);
    expect(response.body.ecuDeviceId).toBe("device-001");
  });
});
