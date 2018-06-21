'use strict';

const config = require ('./config');
const jTemplates = require ('./jTemplates');
const h = require ('./helpers'); // Helpers Functions

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
        if (_.isString(val)) res.send(val); else res.json(val);
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
 * http://localhost:8000/readxlsx?fid=16n34iM04Ah6IlhYvFRa_7nTLQBOg2tFQ  1 ver
 * http://localhost:8000/newDFArchive?driveid=1F0QMZeEUSYJbKGvvTOcfSn8jZE9dnLBq
 * https://drive.google.com/file/d/1F0QMZeEUSYJbKGvvTOcfSn8jZE9dnLBq/view?usp=sharing
 *
 *
 * */

server.get('/newDFArchive', (req, res) => {
    h.CreateArchive(req, res);
});




server.listen((process.env.PORT || 8000), () => {

    console.log(
        `Server is up and running on port: ${(process.env.PORT || 8000)}` );
});