const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Use the dynamic port provided by Railway
const PORT = process.env.PORT || 8080;  // fall back to 8080 for local dev
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});

