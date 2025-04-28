const express = require('express');
const cors = require('cors'); // Enable CORS for frontend integration
const app = express();
app.use(express.json());
app.use(cors());

// Set the correct port for Cloud Run
const PORT = process.env.PORT || 8080;

// Sample Pet Data (Replace with Firebase DB later)
let pets = {
    "pet_001": { name: "Buddy", location: { lat: 40.7128, lng: -74.0060 } },
    "pet_002": { name: "Bella", location: { lat: 34.0522, lng: -118.2437 } }
};

// ✅ Health Check Route
app.get('/', (req, res) => {
    res.send('Pet Pulse Backend is Running 🚀');
});

// ✅ Fetch All Pets
app.get('/pets', (req, res) => {
    res.json(pets);
});

// ✅ Fetch a Specific Pet by ID
app.get('/pets/:id', (req, res) => {
    const petId = req.params.id;
    if (pets[petId]) {
        res.json(pets[petId]);
    } else {
        res.status(404).json({ error: "Pet not found" });
    }
});

// ✅ Update a Pet's Location
app.put('/pets/:id/location', (req, res) => {
    const petId = req.params.id;
    const { lat, lng } = req.body;
    if (pets[petId]) {
        pets[petId].location = { lat, lng };
        res.json({ message: "Location updated successfully", location: pets[petId].location });
    } else {
        res.status(404).json({ error: "Pet not found" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
