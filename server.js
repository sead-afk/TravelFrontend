const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle all routes by serving the main index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Use the dynamic port provided by Railway
const PORT = process.env.PORT || 3000;
console.log(`Attempting to start on port: ${PORT}`);
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});


