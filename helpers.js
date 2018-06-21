/**
 * Helpers Functions
 */

'use strict';

const config = require ('./config');

//const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
//const xlsxp = require ('node-xlsx');
//necessario per corretto path nei diversi container...
const appDir = process.cwd();

const xlsxp = require ('node-xlsx');
const XLSX= require ('xlsx');
const _ = require ('underscore');
const jTemplates = require ('./jTemplates');
//const uuidv4 = require('uuid/v4');


var apps={};

var me = {


    /* RESPONSES FROM EXCEL FILES: Load responses for all apps from xslx files in apps[appcode].data */
    loadAllApps: function() {
        for (var appcode in config.APPS) {
            console.log(`load ${appcode} `)
            me.callPromise(me.loadApp,[appcode]).then(
                (data) => {
                    console.log(`loaded  ${JSON.stringify(data)}`)
                }
            );
        };

    }

    /* Function used to reload an application (Excel)
     * to be used when the excel responses file is updated
     * */

    , reload:  function(req, res) {
        const appcode=req.query.appcode;
        return me.callPromise(me.loadApp,[appcode]).then(
            (data) => JSON.stringify(data)
        );
    }

    /******** Load responses for a single app in apps.data
     *
     * */
    ,loadApp: function(appcode, resolve, reject) {
        var newapp={}, log;
        const appObj =config.APPS[appcode];
        // get the excel files
        // read data from stream
        // load info in newapp
        // load newapp in apps[appcode].data

        try {
            // originalRequest --> dovrebbe essere intent
            var driveUrl = `https://drive.google.com/uc?export=download&id=${appObj.driveid}`;

            https.get(driveUrl, function (xlsxresponse) {

                var buffers = [];
                xlsxresponse.on('data', function (data) {
                    buffers.push(data);
                });
                xlsxresponse.on('end', function () {
                    let buffer = Buffer.concat(buffers);
                    let workSheet = XLSX.read(buffer, {type: "buffer"});
                    apps[appcode]={};


                    /* DO SOMETHING WITH workbook IN THE CALLBACK */

                    _.each(workSheet.Sheets,
                        (sheet, sheetname) => {
                            const sheetData = XLSX.utils.sheet_to_json(sheet, {raw: false});
                            const fieldslist=_.union(_.flatten(_.map(sheetData, (row) => _.keys(row)),true));

                            /* Parameters must begin with P_*/
                            const paramlist = _.reject(fieldslist, (value) => (value.indexOf("P_")!=0));
                            let locale = sheetname.slice(-2);
                            /* if no multicode --> default language*/
                            if (config.APPS[appcode].locale.indexOf(locale)<0) locale=config.APPS[appcode].locale[0];

                            apps[appcode].data = _.union(apps[appcode].data,sheetData.map((riga)=> _.extend(riga,{"locale":locale })) );
                            apps[appcode].fieldslist=_.union(apps[appcode].fieldslist, fieldslist);
                            apps[appcode].paramlist=_.union(apps[appcode].paramlist, paramlist);


                        });
                    apps[appcode].data = me.gruppa(apps[appcode].data, ["locale", ...apps[appcode].paramlist] );
                    if (resolve) resolve(apps[appcode].data);
                });
            });
        } // end try
        catch(error) {
            console.log("Error in load ..."+error);
            if (resolve) resolve(error);
        }

    }

    /* GET REPLIES ********/
    , queryTexts: function(query) {
        if (!query.appcode || !apps[query.appcode] || !apps[query.appcode].data) return null;
        let parms=_.compact(apps[query.appcode].paramlist.map( (pcode) => query.parameters[pcode])

        );

        let workData=apps[query.appcode].data[query.locale];
        var recurF=function() {
            if (!parms.length) return workData;
            let workparm=parms.shift(); workData=workData[workparm]||workData;
            return recurF();
        };
        return recurF();

    }

    /* ask ..and reply  main function */

    , ask: function(req, res) {

        /*
         * POST: body example ABC app
         { "id": "6b0cf303-dd0d-463a-b87b-f778f713201d",
         "timestamp": "2018-06-18T11:32:50.408Z",
         "lang": "en",
         "result":
         { "source": "agent",
         "resolvedQuery": "Google events",
         "speech": "",
         "action": "giveCourse",
         "parameters": {
         "P_GROUP": "GOOGLE"
         , "P_TYPE": "CORSI"
         , "appcode": "ABC"
         },
         "contexts": [
         {
         "name": "userdata",
         "parameters": {"appcode": "ABC"},
         "lifespan": 0
         }
         ],
         "metadata": {},
         "fulfillment": {},
         "score": 1 }
         }
         *
         * */

        let query=this.getmyQuery(req);

        console.log(JSON.stringify(query.parameters));
        let responses= me.queryTexts(query); // todo add language and functions
        let isArray= _.isArray(responses); // todo add language and functions

        /* null Response: fallback todo */

        /* find template out from jtemplates
         * casi: array e singola risposta
         * source - agent e google todo add others
         * */

        /* let template=   jTemplates.get(`response_${query.source}_${query.version}`); //response_agent_1
         let templatedett=  (isArray) ?  jTemplates.get(`responseD_${query.source}_${query.version}`) :null; //responseD_agent_1
         */
        let myresp=   jTemplates.get(`basicResponse_${query.version}`);

        /* merge data out + additional functions  */

        if (isArray) {
            myresp.speech=responses[0];
            myresp.displayText=responses[0];
            let msgT= myresp.messages.shift();
            let RichmsgT= myresp.data.google.richResponse.items.shift();
            myresp.messages=responses.map(resp => { var msg= Object.assign({}, msgT); msg.speech=resp; return msg; });
            myresp.data.google.richResponse.items=responses.map(resp => { var msg= Object.assign({}, RichmsgT);
                msg.simpleResponse.textToSpeech=resp; return msg; });
        }
        else
        {
            myresp.speech=responses;
            myresp.displayText=responses;
            myresp.messages[0].speech=responses;
            myresp.data.google.richResponse.items[0].simpleResponse.textToSpeech=responses;
            // multiple

        }
        //Context in -out
        myresp.data.contextOut=me.thereis(req,"body.result.contexts");

        /* Prepare output work */

        /* Response può tornare un array di risposte
         * a seconda dell'ambiente e di come possono essere visualizzate vai ...*/
        console.log(responses);
        /*se è un array trasforma in stringa completa
         var mystring=(_.isArray(responses)) ? _.pluck(responses, 'text2speech').join(" ") : responses['text2speech'] ;*/

        /* Returns response as a promise */
        return me.getPromiseresolved(myresp);
    }
    // todo in ut
    , thereis: function(mainobj,objTxt) {
        try {
            var w=eval('mainobj.'+objTxt); return (w);
        }
        catch (e) {
            return null;
        }}
    , getmyQuery: function(req) {
        /* */
        let me=this;
        let caso=(req.method=="GET") ? "test"
            : (req.body.result) ? "V1"
                : (req.body.queryResult) ? "V2"
                    : "V1"; // todo facebook

        return (caso==="V1") ? {
                "parameters": _.extend(req.body.result.parameters,me.thereis(req,"body.result.contexts[0].parameters") ) //todo userdata
                , "userquery": req.body.result.resolvedQuery
                , "locale" : req.body.lang.substr(0, 2)
                , "appcode": req.body.result.parameters.appcode
                , "source" : req.body.result.source
                , "version" : 1
            }
            : (caso==="V2") ? {
                    "parameters": _.extend(req.body.queryResult.parameters,me.thereis(req,"req.body.queryResult.outputContexts[0].parameters") )
                    , "userquery": req.body.queryResult.queryText
                    , "locale" : req.body.queryResult.languageCode
                    , "appcode": req.body.result.parameters.agentcode
                    , "source" : req.body.originalDetectIntentRequest.source
                    , "version" : 2
                }
                : {"parameters": req.query, "test":1, "lang": "en" , "appcode": req.query.appcode};


    }


    /* DialogFlow Archive creation
     * Parameters:
     *    fid --> driveid file excel with the project
     *    // todo italian and control the result
     *    1. create a new project
     *    2. make the archive (export)
     *    3. try the same project with excel
     *    3. compare the archives
     *
     *  chiamato da h.CreateArchive(req, res); https://drive.google.com/open?id=1K18vCWGOqdoqjNcmuA66-3JjzL0rz-KH
     * */

    , CreateArchive(req, res) {
        var driveFid= req.query.driveid;
        var driveUrl = `https://drive.google.com/uc?export=download&id=${driveFid}`;


        try {

            https.get(driveUrl, function (xlsxresponse) {
                var buffers = [];
                xlsxresponse.on('data', function (data) {
                    buffers.push(data);
                });
                xlsxresponse.on('end', function () {
                    var buffer = Buffer.concat(buffers);
                    var workSheet = me.xparse(buffer); //xlsxp.parse( , {type: "buffer"}


// Avvio il download dello zip verso il client.

                    jTemplates.CreateArchive(workSheet).then((zblob) => { // 1) generate the zip file

                        res.set('Content-Type', 'application/zip');
                        res.set('Content-Disposition', 'attachment; filename=file.zip');
                        res.set('Content-Length', zblob.length);
                        res.end(zblob, 'binary');
                        return;

                    });

                });
            });
        }
        catch(ex) {
            console.error(ex);
            res.send(`Ohi error! look ${ex.message}`);
            // expected output: SyntaxError: unterminated string literal
            // Note - error messages will vary depending on browser
        }

    }

    , CreateDialogArchive: function(req, res) {}

    /*  Utilities */
    , getPromiseresolved: function(data) {
        return new Promise((resolve, reject) => {resolve(data);});
    }
    , callPromise: function(myfunct, parms) {
        return new Promise((resolve, reject) => {
            const arr=[...(parms||[]), resolve, reject ];
            return myfunct(...arr)});
    }
    , gruppa : function(ArrofObject,keys) {
        if (!keys.length) return ArrofObject;
        const [key, ...newkeys]=keys;
        return  (!_.find(ArrofObject, (obj)=>obj[key]) ) ? ArrofObject :
            _.mapObject(_.groupBy(ArrofObject, key),
                (arry,kk) => {
                    return me.gruppa(arry.map(obj2 => _.omit(obj2, key)),newkeys);
                }
            );
    }

    , xparse : function (mixed, options = {}) {

        var issstr = typeof mixed === 'string';

        const workSheet = XLSX[issstr ? 'readFile' : 'read'](mixed, options);
        return Object.keys(workSheet.Sheets).map((name) => {
            const sheet = workSheet.Sheets[name];
            return {name, data: XLSX.utils.sheet_to_json(sheet, { raw: options.raw !== false})};
        });
    }



};

module.exports=me;