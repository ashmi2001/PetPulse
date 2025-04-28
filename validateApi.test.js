const axios = require("axios");
const { expect } = require("chai");

describe('PetPulse Backend API', function() {
  it('should store GPS data successfully', async function() {
    const testData = {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date().toISOString(),
      deviceId: "unit_test_yash"
    };

    const response = await axios.post("http://localhost:3000/storeGPS", testData);
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
  });
});
