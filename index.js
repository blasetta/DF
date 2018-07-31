'use strict';

const config = require ('./config');
const jTemplates = require ('./jTemplates');
const h = require ('./helpers'); // Helpers Functions
const fs = require('fs');
//const http = require('http');
const https = require('https');
var privateKey, certificate, ca, credentials, httpsServer;

var logLoad=h.loadAllApps();


/* Libraries needed */
const express = require('express');
const bodyParser = require('body-parser');


//returns the current working directory
const appDir = process.cwd();


/* HTTP Server Configuration */

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

if (config.https) {
    // Certificate
    privateKey = fs.readFileSync('/home/idcac/NODEROOT/SSL/privkey1.pem', 'utf8');
    certificate = fs.readFileSync('/home/idcac/NODEROOT/SSL/cert1.pem', 'utf8');
    ca = fs.readFileSync('/home/idcac/NODEROOT/SSL/chain1.pem', 'utf8');


    credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    httpsServer = https.createServer(credentials, server);

}


/* API  */

//http://localhost:8000/test?P_GROUP=GOOGLE&P_TYPE=CORSI&appcode=ABC
server.get('/test', (req, res) => {
    // Always returns promise
    var myTestfunction=h.ask;

    myTestfunction(req,res).then( (val) => {
        res.send(val);
       });
});

/* Reload App from excel  */

server.get('/reload', (req, res) => {
    h.reload(req,res).then( (val) => {
        if (   typeof val === 'string' ) res.send(val); else res.json(val);
    });

});

server.get('/', (req, res) => {
    res.send('This is the root but it leads nowhere');
});


/* Reply simple from DialogFlow and Action on Google based on parameters
 * get the app from request
 * get the other parameters
 * Search response and
 * prepare reply
  * */
server.post('/ask', (req, res) => {

    h.ask(req,res).then( (val) => {
        res.json(val);
    });
});



/*
 *
 * Automatic creation of DialogFlow Archive "Archive.zip"  (o nome qualunque)
 *
 *
 * Read Excel file name from parameter
 * xlsx file must have a fixed structure -
 * It sets up the Json files and then sips them:
 *
 * http://localhost:8000/newDFArchive?driveid=16n34iM04Ah6IlhYvFRa_7nTLQBOg2tFQ
 * http://localhost:8000/newDFArchive?driveid=1Dqg_21UcxMWALva4GWMNjCEcPipcToAC
 *
  *
 * */

server.get('/newDFArchive', (req, res) => {
    h.CreateArchive(req, res);
});

server.get('/reloadAll', (req, res) => {
    res.send( "OK, sent"); // status is an array
    h.loadAllApps().then( (status) => {
            console.log( "OK, done")
        }
        , reason => {
            console.log(reason);
            res.send( `Error: ${reason}`);
        });

});


if (config.https) {
    httpsServer.listen((8443), () => {

        console.log(
            `Server is up and running on port: ${(  8443 )}`);
    });
}
else {
    server.listen((process.env.PORT || 8000), () => {

        console.log(
            `Server is up and running on port: ${(process.env.PORT || 8000)}`);
    });
}


