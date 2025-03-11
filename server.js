const express = require('express');
const app = express();

// Set the correct port for Cloud Run
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Pet Pulse Backend is Running 🚀');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
