const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http');
const queststring = require('querystring');
const fs = require('fs');

const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/assessment_request', (req, res) => {
    /*
    This endpoint recieves a assessment request
    It then will post a start message to the tympa device
    The start message enitiates a timer on the tympa device
    */
    console.log('Recieved assessment request')
    console.log('Posting start event to tympa device...')

    fs.appendFile('log.txt', '[4] Assessment request recieved\n', function(err) {
        if (err) throw err;
        console.log('Saved');
    });

    var start_encounter = queststring.stringify({
        'patient_id': 963401,
        'organisation': 013004,
        'type': 'start_encounter',
        'data': {}
    });
    var options = {
        uri: `http://[::1]:${port}`,
        port: 3000,
        path: '/start_event',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(start_encounter)
        }
    };

    var httpreq = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log(`Body: ${chunk}`);
        });
        res.on('end', function() {
            res.send('ok');
        });
    });
    httpreq.write(start_encounter);
    httpreq.end();
    fs.appendFile('log.txt', '[5] Tympa start encounter send\n', function(err) {
        if (err) throw err;
        console.log('Saved');
    });
});

app.post('/encounter_complete', (req, res) => {
    /*
    This endpoint recieves a encounter complete message
    */
    console.log('Recieved encounter complete message')
});

app.post('/tympa_device_finish', (req, res) => {
    /*
    This endpoint recieves a finish event from the tympa device
    It then posts the assessment report to the pharma server
    */
    console.log('The encounter has been completed')
    console.log('Posting assessment report...')

    fs.appendFile('log.txt', '[11] Tympa finish recieved\n', function(err) {
        if (err) throw err;
        console.log('Saved');
    });

    var assessment_report = queststring.stringify({
        'patient_id': 963401,
        'organisation': 013004,
        'type': 'assessment_report',
        'data': {}
    });

    var options = {
        uri: `http://[::1]:${port}`,
        port: 8080,
        path: '/assessment_report',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(assessment_report)
        }
    };

    var httpreq = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log(`Body: ${chunk}`);
        });
        res.on('end', function() {
            res.send('ok');
        });
    });
    httpreq.write(assessment_report);
    httpreq.end();

    fs.appendFile('log.txt', '[12] Assessment report sent\n', function(err) {
        if (err) throw err;
        console.log('Saved');
    });
});

app.listen(port, () => {
    console.log(`Listerning on port: ${port}`)
});