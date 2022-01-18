const express = require('express');
const http = require('http');
const path = require('path');

const PORT = 3000;

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server is running in port ${PORT}...`));
