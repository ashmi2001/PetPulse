const request = require("supertest");
const app = require("../server"); // Adjust to match your file structure

describe("API Testing for PetPulse Backend", () => {
  test("POST /storeGPS should store GPS data successfully", async () => {
    const gpsData = {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date().toISOString(),
    };
    const response = await request(app).post("/storeGPS").send(gpsData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "GPS data stored successfully");
  });

  test("GET /getLocation should return the latest GPS location", async () => {
    const response = await request(app).get("/getLocation");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      latitude: expect.any(Number),
      longitude: expect.any(Number),
    }));
  });

  test("POST /checkGeofence should respond with geofence status", async () => {
    const geofenceData = {
      latitude: 37.7749,
      longitude: -122.4194,
    };
    const response = await request(app).post("/checkGeofence").send(geofenceData);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("insideGeofence", expect.any(Boolean));
  });
});
