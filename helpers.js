/**
 * Helpers Functions
 */

'use strict';

const config = require ('./config');

//const http = require('follow-redirects').http;
const https = require('follow-redirects').https;
// correct path for different containers ...
const appDir = process.cwd();

const xlsxp = require ('node-xlsx');
const XLSX= require ('xlsx');
const  _ = require ('underscore');
const jTemplates = require ('./jTemplates');
//const uuidv4 = require('uuid/v4');


var apps={};

var me = {

    Apps: apps
    /* RESPONSES FROM EXCEL FILES: Load responses for all apps from xslx files in apps[appcode].data */
    , loadAllApps: function() {
        /* Get apps Data  from drive */
        let driveAppid=config.apps_driveid;

        let driveUrl = `https://drive.google.com/uc?export=download&id=${driveAppid}`;

        return me.getHttps(driveUrl).then(
            (data) => {
                /* Returns a Buffer */

                config.APPS=JSON.parse(data.toString());
                let myPromises=[];
                for (var appcode in config.APPS) {
                    config.APPS[appcode].appcode=appcode;
                    myPromises.push(
                        me.callPromise(me.loadApp,[appcode])
                    );
                }
                return Promise.all(myPromises);
            }
        )
            .catch(
                (error) => {
                    let msg=`ERROR: ${error.message}`;
                    console.log(msg);
                    return me.getPromiseresolved(msg);

                });


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
        let driveUrl = (appObj.gsheet) ? `https://docs.google.com/spreadsheets/d/e/${appObj.driveid}/pub?output=xlsx`
            : `https://drive.google.com/uc?export=download&id=${appObj.driveid}`;

        return me.getHttps(driveUrl).then(
            (buffer) => {
                // handle error todo loadApp reject(reason);
                let workSheet = XLSX.read(buffer, {type: "buffer"});
                apps[appcode]=appObj;

                _.each(workSheet.Sheets,
                    (sheet, sheetname) => {
                        const sheetData = XLSX.utils.sheet_to_json(sheet, {raw: false});
                        const fieldslist=_.union(_.flatten(_.map(sheetData, (row) => _.keys(row)),true));

                        /* Parameters must begin with P_*/
                        const paramlist = _.reject(fieldslist, (value) => (value.toUpperCase().indexOf("P_")!=0));
                        let locale = sheetname.slice(-2);
                        /* if no multicode --> default language*/
                        if (config.APPS[appcode].locale.indexOf(locale)<0) locale=config.APPS[appcode].locale[0];

                        apps[appcode].data = _.union(apps[appcode].data,sheetData.map((riga)=> _.extend(riga,{"locale":locale })) );
                        apps[appcode].fieldslist=_.union(apps[appcode].fieldslist, fieldslist);
                        apps[appcode].paramlist=_.union(apps[appcode].paramlist, paramlist);


                    });
                apps[appcode].data = me.gruppa(apps[appcode].data, ["locale", ...apps[appcode].paramlist] );
                resolve("OK"); // success

            }
        );
    }

    /* GET REPLIES ********/
    , queryTexts: function(query) {
        if (!query.appcode || !apps[query.appcode] || !apps[query.appcode].data) return null;


        // all parameters or any
        let parms=apps[query.appcode].paramlist.map((val)=>query.parameters[val]||"any");

        //console.log(parms);

        var workData=apps[query.appcode].data[query.locale||"en"];

        if (!workData) return "ERROR: no Data";
        //console.log(workData);

        /* ignore current parmater */
        var getWokdataany= function(wData) {
            if (_.isArray(wData)) return wData;

            // Array only with values
            const base=_.flatten(_.reduce(wData, (memo, group)=>{memo.push(group); return memo;},[]));
            if (base[0].text2speech) return base; // last run
            const allkeys=_.keys(_.reduce(base, (memo, row) => _.extend(memo, row), {}));
            var newObj={};
            _.each( allkeys, (key) => {newObj[key] =_.flatten(_.pluck(base,key));  });
            return newObj;
        };


        const recurF=function() {

            if (!parms.length) return (_.isArray(workData)) ? workData  :  _.flatten(_.values(workData)) ;

            let workparm=parms.shift(); if (_.isArray(workparm)) workparm=workparm[0]; // todo handle array
            // _.reduce(workData, (memo, group)=>[...memo, ...group],[])
            workData=(workparm=="any" || !workData[workparm]) ? getWokdataany(workData) : workData[workparm];
            return recurF();
        };
        return recurF();

    }

    /* ask ..and reply  main function */

    , ask: function(req, res) {

        /* transform the request in a more agile object */

        let query=me.getmyQuery(req);

        if (query.source ==="alexa") return me.getmyAlexa(req,query); //me.getPromiseresolved(jTemplates.get("alexaRes")); let responses= me.queryTexts(query); // Get responses Object

        // console.log(JSON.stringify(query));
        let responses= me.queryTexts(query); // Get responses Object
        if (!_.isArray(responses)) responses=[responses];
        let isMultiple= (responses.length>1);

        /*
        * API test con meetup
        *   let myURL=responses[0].APIUrl;
        *   me.Apps[query.appcode]
        *   const myCtx=_.extend({}, query.parameters , me.Apps[query.appcode]);
        *   me.dyntempl(myURL,myCtx);
        *
        * */

        let myresp =  jTemplates.get(`basicResponse_${query.version||1}`);

        myresp.speech=responses[0].text2speech;
        myresp.displayText=`${responses[0].text2speech} ${responses[0].link}`;

        let myiden= `${(isMultiple) ? "M":"S"}-${query.source||"agent"}-v${query.version||1}`;

        let log= `***** query ${JSON.stringify(query,null, 2)} --> procedura ${myiden} *****`;

        //responses[0].text2speech+=log;




        /* merge data out + additional functions  */

        let Fresp={

              /* minimal result DialogFlow text 1*/
              "S-agent-v1" : function() {
                  delete myresp.data;
                  myresp.messages.push({ "type": 0, "speech": myresp.displayText });
              }
            /* DialogFlow text multiple*/
            , "M-agent-v1" : function() {

                //myresp.messages[0].speech=responses[0].text2speech;
                let DESCRIP= responses[0].DESCRIP;
                if (DESCRIP && DESCRIP.indexOf("${")) DESCRIP=me.dyntempl(DESCRIP,{ "count": responses.length});
                let CompleteMsg= DESCRIP||"";
                let CompleteMsgText= CompleteMsg;


                _.each(responses, (robj, index)=> {
                    CompleteMsg+=`  ${index+1}.  ${robj.TITLE}: ${robj.text2speech}. \n  \n 
`;
                    CompleteMsgText+=`  ${index+1}.  ${robj.TITLE}: ${robj.text2speech} - link: ${responses[0].IMGURL} \n  \n 
`;
                });
                myresp.speech=CompleteMsg;
                myresp.displayText=CompleteMsgText;
                myresp.messages.push({ "type": 0, "speech": CompleteMsg });
                delete myresp.data;
            }
            /* Single Action on Google*/
            , "S-google-v1" : function() {
                myresp.messages.push({"speech":responses[0].text2speech});
                myresp.data.google.richResponse.items.push({  "simpleResponse": {  "textToSpeech": responses[0].text2speech  } });


                if (responses[0].Suggestions) {
                    const wsuggestions=responses[0].Suggestions.split(",").map( csug => { return {"title":csug.trim()}});
                    myresp.data.google.richResponse.suggestions=wsuggestions;
                }


                var basicC = JSON.parse( JSON.stringify(jTemplates.get(`basicCard_${query.version||1}`))); //????

                basicC.title = responses[0].TITLE;
                basicC.subtitle = responses[0].text2speech;
                basicC.formattedText = responses[0].text2speech;

                if (responses[0].IMGURL) {

                    basicC.image.url = responses[0].IMGURL;
                    basicC.image.accessibilityText = responses[0].IMGALTTXT;
                }
                else delete basicC.image;


                if (responses[0].link) {
                basicC.buttons[0].title = "Link";
                basicC.buttons[0].openUrlAction.url = responses[0].link;
                }
                else delete basicC.buttons;

                myresp.data.google.richResponse.items.push({"basicCard": basicC });

            }
            /* Multiple  Action on Google ver.1*/
            , "M-google-v1" : function() {
                console.log(" sono in google multiplo");


                //myresp.messages.push({"speech":responses[0].text2speech});
                if (responses.length>10) responses= _.first(responses, 10); // Carousel max 10

                let DESCRIP=responses[0].DESCRIP || responses[0].text2speech;


                if (DESCRIP && DESCRIP.indexOf("${"))
                    DESCRIP=me.dyntempl(DESCRIP,{ "count": responses.length});

                console.log(" DESCRIP "+ DESCRIP);

                myresp.data.google.richResponse.items.push({  "simpleResponse": {  "textToSpeech": ` ${DESCRIP}`,  "displayText": ` ${DESCRIP}`  } });



                if (responses[0].Suggestions) {
                    const wsuggestions=responses[0].Suggestions.split(",").map( csug => { return {"title":csug.trim()}});
                    myresp.data.google.richResponse.suggestions=wsuggestions;
                }



                var AogObj = {"carouselBrowse": { "items": [] } } ;

                responses.forEach( robj => {
                    let carouselObj = jTemplates.get(`carouselItem_${query.version}`);

                    carouselObj.title = robj.TITLE;
                    carouselObj.description = robj.text2speech;
                    carouselObj.footer = robj.FOOTER||"";
                    carouselObj.image.url = robj.IMGURL||"";
                    carouselObj.image.accessibilityText = robj.IMGALTTXT||"";
                    carouselObj.openUrlAction.url = robj.link||"";
                    carouselObj.openUrlAction.urlTypeHint = robj.URLHINT||"";


                    // Addition of single Carousel Items
                    AogObj.carouselBrowse.items.push(carouselObj);

                });

                myresp.data.google.richResponse.items.push(AogObj);



            }
            , "S-telegram-v1" :  function() {
                let textTempl = `@${req.body.originalRequest.data.message.chat.username} Ecco le info richieste:\n<b>${robj.TITLE}</b>\n<i>${robj.DESCRIP}</i>\n<a href="${robj.IMGURL}">&#8205;</a>`;

                let buttonTpl = { "inline_keyboard": [ [ { "text": "linkS", "url": robj.link }]] } ;


                myresp.data.telegram.text=textTempl;
                myresp.data.telegram.reply_markup=buttonTpl;
            }
            , "M-telegram-v1" :  function() {}
            /* todo version 2 */
            , "S-agent-v2" :  function() {}
            , "M-agent-v2" : function() {}
            , "S-google-v2" : function() {}
            , "M-google-v2" : function() {}
        };

        Fresp[myiden]();


        if (myresp.data && me.thereis(req,"body.result.contexts")) myresp.data.contextOut=me.thereis(req,"body.result.contexts");

        console.log(myresp);

        /* Prepare output work */

        /* Response può tornare un array di risposte
         * a seconda dell'ambiente e di come possono essere visualizzate vai ...*/

        /*se è un array trasforma in stringa completa
         var mystring=(_.isArray(responses)) ? _.pluck(responses, 'text2speech').join(" ") : responses['text2speech'] ;*/

        /* Returns response as a promise */

        return me.getPromiseresolved(myresp);
    }
    , getmyAlexa: function(req,query) {

        let AlexaResponse=jTemplates.get("alexaRes");
        let applicationId=query.appcode, appcode=null;
        let myConfig=_.findWhere(config.APPS, {"alexa.skillid": applicationId});
        let responses=null;
        if  (myConfig && myConfig.appcode) appcode=myConfig.appcode;
        else return me.getPromiseresolved(AlexaResponse);
        query.applicationId=applicationId; query.appcode=appcode;

        /* 2. check if not ask  and give reply*/
        if (query.intent!=="ask") {
            // la query con l'intent con il primo parametro
            query.parameters[myConfig.fieldslist[0]]=query.intent;

        }

        /* 1. transform query  variables slots*/
        else {
            query.parameters=_.mapObject(query.userquery, (obj) => obj.value||"any" );
        }

        /* 3. ask get replies (== altro) */
        responses= me.queryTexts(query);
        let response=null;
        if (responses.length>0) response= responses[0].text2speech;
        else {
            query.parameters[myConfig.fieldslist[0]]="AMAZON.FallbackIntent";
            responses= me.queryTexts(query);
            response=(responses.length>0) ? responses[0].text2speech :
                "bohhhh!!! ma che stai a dì?";
        }


        /* todo: find frase per non found ... reprompt responsenotfound*/

        AlexaResponse.response.outputSpeech.text=response;
        AlexaResponse.response.reprompt.outputSpeech.text="Reprompt ...."+response;

        return me.getPromiseresolved(AlexaResponse);

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
            : (req.body.session && req.body.session.application) ? "Alexa"
            : (req.body.result) ? "V1"
                : (req.body.queryResult) ? "V2"
                    : "V1"; // todo facebook

        //console.log(caso + "*************************");

        let log=` ###request####  ${JSON.stringify(( req.body) ? req.body : req.query)} ### FINE request####  `;

        //console.log(log);

        return (caso==="V1") ? {
                "parameters": _.extend(req.body.result.parameters,me.thereis(req,"body.result.contexts[0].parameters") ) //todo userdata
                , "userquery": req.body.result.resolvedQuery
                , "locale" : req.body.lang.substr(0, 2)
                , "appcode": req.body.result.parameters.appcode
                , "source" : (me.thereis(req,"body.originalRequest.source")) ? req.body.originalRequest.source : req.body.result.source
                , "version" : 1
            }
            : (caso==="V2") ? {
                    "parameters": _.extend(req.body.queryResult.parameters,me.thereis(req,"body.queryResult.outputContexts[0].parameters") )
                    , "userquery": req.body.queryResult.queryText
                    , "locale" : req.body.queryResult.languageCode
                    , "appcode": req.body.result.parameters.agentcode
                    , "source" : req.body.originalDetectIntentRequest.source // todo check
                    , "version" : 2
                }
                : (caso==="Alexa") ? {
                        "parameters": {}
                        , "userquery": me.thereis(req.body,"request.intent.slots")||null
                        , "locale" : (req.body.request.locale||"en").slice(0,2).toLowerCase()
                        , "appcode": req.body.session.application.applicationId
                        , "source" : "alexa"
                        , "intent" : me.thereis(req.body,"request.intent.name")||"AMAZON.welcome"
                        , "version" : parseInt(req.body.version||"1")
                    }
                : {"parameters": req.query, "test":1, "lang": "en" , "appcode": req.query.appcode
                    , "version" : 1,  "source" : "google"};

        //_.findWhere(config.APPS, {"alexa.skillid": "amzn1.ask.skill.58529b3e-0efb-4074-9915-8e6ee226dc39"})

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
     *  chiamato da h.CreateArchive(req, res);
     * */

    , CreateArchive(req, res) { /*****/
        var driveid= (req.query.driveid) ? req.query.driveid
            : (req.query.appcode) ? apps[req.query.appcode].driveidArchive
                : null;
        if (!driveid) {res.send(`Ohi error! No file submitted!!!!`); return;}

        var driveUrl = (req.query.gsheet) ? `https://docs.google.com/spreadsheets/d/e/${driveid}/pub?output=xlsx`
            :`https://drive.google.com/uc?export=download&id=${driveid}`;


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

    /*  Utilities
     * getPromiseresolved --> resolve in a promise anyway
     * */

    , getPromiseresolved: function(data) {
        return new Promise((resolve, reject) => {resolve(data);});
    }

    /*
     *  callPromise --> incapsulate any function in a Promise
     * */

    , callPromise: function(myfunct, parms) {
        return new Promise((resolve, reject) => {
            const arr=[...(parms||[]), resolve, reject ];
            return myfunct(...arr)});
    }

    /*
     *  callPromise --> incapsulate any function in a Promise
     *
     *
     * */

    , getHttps: function(url) {
        let buffers = [];

        return new Promise((resolve, reject) => {

            https.get(url, function (resp) {
                resp.on('data', (chunk) => {
                    buffers.push(chunk);
                });
                resp.on('end', () => {
                    resolve(Buffer.concat(buffers));
                });


            }) // end https.get
                .on("error", (err) => {
                    reject(err);
                });
        }); // end promise

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
    , replaceall: function (string, sfind, sreplace) {
        let escF= function escapeRegExp(str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        };
        return string.replace(new RegExp(escF(sfind), 'g'),sreplace);
    }
    , dyntempl: function (templateString, templateVars) {

        // replace
        let newT=(templateString.indexOf("$[")>=0) ? me.replaceall(me.replaceall(templateString,"$[","${")  ,"]$","}$") : templateString;
        newT=me.replaceall(me.replaceall(newT,"${","${this."),"${this.this.", "${this.");
        return new Function("return `"+newT +"`;").call(templateVars);
    }

/*
*                     let mytempl=`{"type": "suggestion_chips","platform": "google", "lang": "$[this.locale]$", "suggestions": 0 }` ;
 let dyntempl=function(templateString, templateVars){ return new Function("return `"+templateString +"`;").call(templateVars); }
 */

};

module.exports=me;
