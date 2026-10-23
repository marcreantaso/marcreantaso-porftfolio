const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
