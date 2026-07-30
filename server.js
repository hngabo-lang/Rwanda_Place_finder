// starts up my web, serves the frontend files and passes any /api/places requests over to routes/places.js

require('dotenv').config();

const express = require('express');
const path = require('path');
const placesRouter = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 3000;

// serve the html/css/js files sitting in public/
app.use(express.static(path.join(__dirname, 'public')));

// anything hitting /api/places gets handled in places.js
app.use('/api/places', placesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
