const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the index.html for any route not matched
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Use Railway's default port or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});
