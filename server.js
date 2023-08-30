const express = require('express');
const cors = require('cors');
const process = require('process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

app.use('/v1/readme', require('./routes/v1/root'));
app.use('/v1/getEventList', require('./routes/v1/getEventList'));
app.use('/v1/getEventDetails', require('./routes/v1/getEventDetails'));
app.use('/v1/getVenueDetails', require('./routes/v1/getVenueDetails'));
app.use('/v1/getSuggestions', require('./routes/v1/getSuggestions'));

app.get('/', (_, res) => {
    const readmePath = path.join(__dirname, 'README.md');
    fs.readFile(readmePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading README.md');
        } else {
            res.set('Content-Type', 'text/plain');
            res.send(data);
        }
    })
});


// app.use(express.static(process.cwd()+"/frontend/dist/my-app"));

// app.get('/', function(req, res) {
//     res.sendFile(process.cwd()+"/frontend/dist/my-app/index.html");
// })

// app.get('/search', function(req, res) {
//     res.sendFile(process.cwd()+"/frontend/dist/my-app/index.html");
// })

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
