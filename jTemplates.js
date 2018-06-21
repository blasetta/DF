
"use strict";
/**
 * Templates JSON for various appls
 */
const uuid = require('uuid/v4');

const T= {
    agent: {
        "description": "#description#",
        "language": "en",
        "disableInteractionLogs": false,
        "disableStackdriverLogs": true,
        "googleAssistant": {
            "googleAssistantCompatible": true,
            "project": "#project_id#",
            "welcomeIntentSignInRequired": false,
            "voiceType": "MALE_1",
            "capabilities": [],
            "protocolVersion": "V2",
            "autoPreviewEnabled": true,
            "isDeviceAgent": false
        },
        "defaultTimezone": "Europe/Madrid",
        "webhook": {
            "url": "#FULLFILLMENT_URL#",
            "headers": {
                "": ""
            },
            "available": true,
            "useForDomains": false,
            "cloudFunctionsEnabled": false,
            "cloudFunctionsInitialized": false
        },
        "isPrivate": true,
        "customClassifierMode": "use.after",
        "mlMinConfidence": 0.3,
        "supportedLanguages": [],
        "onePlatformApiVersion": "v1legacy"
    }
    , pkg: {
        "version": "1.0.0"
    },


    entities_h: {
        "id": "#GEN_UUID#",
        "name": "#synName#",
        "isOverridable": true,
        "isEnum": false,
        "automatedExpansion": false
    },


    entities_def: {
        "value": "#synVal#",
        "synonyms": []
    },

    def_fallint: {
        "id": "#GEN_UUID#",
        "name": "Default Fallback Intent",
        "auto": true,
        "contexts": [],
        "responses": [
            {
                "resetContexts": false,
                "action": "input.unknown",
                "affectedContexts": [],
                "parameters": [],
                "messages": [
                    {
                        "type": 0,
                        "lang": "en",
                        "speech": [
                            "I didn\u0027t get that. Can you say it again?",
                            "I missed what you said. Say it again?",
                            "Sorry, could you say that again?",
                            "Sorry, can you say that again?",
                            "Can you say that again?",
                            "Sorry, I didn\u0027t get that.",
                            "Sorry, what was that?",
                            "One more time?",
                            "What was that?",
                            "Say that again?",
                            "I didn\u0027t get that.",
                            "I missed that."
                        ]
                    }
                ],
                "defaultResponsePlatforms": {},
                "speech": []
            }
        ],
        "priority": 500000,
        "webhookUsed": false,
        "webhookForSlotFilling": false,
        "fallbackIntent": true,
        "events": []
    },


    def_welcint: {
        "id": "#GEN_UUID#",
        "name": "Default Welcome Intent",
        "auto": true,
        "contexts": [],
        "responses": [
            {
                "resetContexts": false,
                "action": "input.welcome",
                "affectedContexts": [],
                "parameters": [],
                "messages": [
                    {
                        "type": 0,
                        "lang": "en",
                        "speech": ["#welcome_sents#"]
                    }
                ],
                "defaultResponsePlatforms": {
                    "google": true
                },
                "speech": []
            }
        ],
        "priority": 500000,
        "webhookUsed": false,
        "webhookForSlotFilling": false,
        "fallbackIntent": false,
        "events": [
            {
                "name": "WELCOME"
            },
            {
                "name": "GOOGLE_ASSISTANT_WELCOME"
            }
        ]
    },

// one block for every sentence, array of obj [{}....{}]
    def_welcintuser: {
        "id": "#GEN_UUID#",
        "data": [],
        "isTemplate": false
    },
// user defined INTENTS


// parameters one for each param, bound to entity

    uintent_h: {
        "id": "#GEN_UUID#",
        "name": "#intentName#",
        "auto": true,
        "contexts": [
            "userdata"
        ],
        "responses": [
            {
                "resetContexts": false,
                "action": "#intentActionParam#",
                "affectedContexts": [
                    {
                        "name": "userdata",
                        "parameters": {},
                        "lifespan": 99
                    }
                ],
                "parameters": [
                    {
                        "id": "#GEN_UUID#",
                        "required": true,
                        "dataType": "@#refEntity#",
                        "name": "#parName#",
                        "value": "#parVal#",
                        "isList": false
                    }
                ],
                "messages": [],
                "defaultResponsePlatforms": {},
                "speech": []
            }
        ],
        "priority": 500000,
        "webhookUsed": true,
        "webhookForSlotFilling": false,
        "fallbackIntent": false,
        "events": []
    },


    /*Train the intent with all the possible combination of words, that binds to entities*/
// one block { ... } inside data for every word
    uintent_uSays: {
        "id": "#GEN_UUID#",
        "data": [
            {
                "text": "#userText#",
                "alias": "#parName#",
                "meta": "@#refEntity#",
                "userDefined": true
            }
        ],
        "isTemplate": false,
        "count": 0
    }

    /* Template for response to Dialogflow and ActiononGoogle ver.1 and ver. 2*/
    , basicResponse_1: {
        "speech": "#speech#",
        "displayText": "#speech#",
        "messages": [{
            "type": 0,
            "speech": "#speech#"
        }],
        "data": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [
                        {
                            "simpleResponse": {
                                "textToSpeech": "this is a simple response"
                            }
                        }
                    ]
                }
            },
            "contextOut": ""
            ,
            "source": "myurl.com"
        }
    }
};




module.exports = {
    get: function(code) {
        return Object.assign({}, T[code]);

    }
    , CreateArchive(workSheet) {

        const JSZip = require("jszip");
        var zip = new JSZip(), me=this;

        workSheet.forEach( (sheetObj)  => {


            let sheetName = sheetObj.name, currJsonTXT;
            //let sheetHeaders=sheetObj.data.shift(); // non serve + qui, prendo oggetto con già gli headers come keys
            let sheetsRows=sheetObj.data; //only dato without headers
            let List_Languages=[];

            /* Loop on sheets and create all the json-> zip files*/

            switch (true) {

                /* AGENT
                 *  Very simple json
                 *  todo: add more variables
                 * */
                case (sheetName.search("AGENT")>=0):{

                    let workJSON=me.get('agent'); // get the template



                    /*Aggiunte saverio - Aggiunta sezione per lang e supportedlang + puntamenti con nome dato nello sheet.*/
                    workJSON.description=sheetsRows[0].descrizione;
                    workJSON.googleAssistant.project=sheetsRows[0].projectid;
                    workJSON.webhook.url=sheetsRows[0].fullfillment_url; List_Languages.push(workJSON.language);

                    workJSON.language = sheetsRows[0].DEF_LANG;
                    if (sheetsRows[0].SUPP_LANG) {
                        workJSON.supportedLanguages =  sheetsRows[0].SUPP_LANG.split(",").map(clang => clang.trim());
                        List_Languages=[List_Languages, ...workJSON.supportedLanguages]; // todo check inside loops
                    }

                    // Creates the file agent.json
                    zip.file("mybot/agent.json", JSON.stringify(workJSON,null,2)); //prettyprint

                    break;
                }

                /* ENTITY


                 There may be many entities sheet ... name is in the sheet label

                 */
                case (sheetName.search("ENTITY")>=0):{

                    /* Header */
                    let workHeader =me.get('entities_h'); //jsnH
                    let entitiName=sheetName.replace("ENTITY-","");
                    workHeader.id=uuid();
                    workHeader.name=entitiName;

                    zip.file(`mybot/entities/${workHeader.name}.json`, JSON.stringify(workHeader,null, 2));



                    /*Aggiunto Saverio.
                     Gestione multi lingua ***** CAMBIARE trasformando il dettaglio con gli oggetti con la lingua e poi il groupby
                     per ogni riga, analizzo colonna x colonna
                     prendo i dati dalle colonne relative, ed esamino i "Lang" dalle colonne relative.*/

                    var jsnDarr = [];
                    var resobj = {} ;

                    sheetsRows.forEach( (erow) => {

                        for (var er in erow) {
                            //console.log(er);
                            if (er!="ent_val")
                            {
                                var currLang = er.replace("ent_syn_","");
                                //console.log(currLang);
                                //console.log(erow);
                                var Workdetail = Object.assign({}, me.get('entities_def'));

                                Workdetail.value=erow.ent_val;
                                Workdetail.synonyms = erow["ent_syn_"+currLang].split(",").map(myval => myval.trim());
                                jsnDarr.push(Workdetail);

                                resobj[currLang]=jsnDarr;
                            }
                        }
                    } );

                    Object.keys(resobj).forEach(function (key) {
                        zip.file(`mybot/entities/${entitiName}_entries_${key}.json`, JSON.stringify(resobj[key],null, 2));
                    });

                    /*Aggiunto Saverio.*/


                    //Array detail of entity jsnDarr
                    /*Modifica Anto, da integrare con...*/
                    /*let Workdetail =sheetsRows.map( (row) => {

                     let workEntity=me.get('entities_def'); //jsnD
                     workEntity.value=row[0];
                     workEntity.synonyms = row[1].split(",").map((item) => item.trim() );

                     return workEntity;

                     });

                     zip.file(`/mybot/entities/${workHeader.name}_entries_en.json`, JSON.stringify(Workdetail, null, 2));*/
                    /*Modifica Anto, da integrare con...*/

                    break;}

                /* Default Welcome Intent - very simple */

                case (sheetName.search("WELCOMEINTENT-DEF")>=0): {
                    let workJSON = me.get('def_welcint');

                    workJSON.id = uuid();

                    // OLD without Lang mgmt
                    // workJSON.responses[0].messages[0].speech = sheetsRows;



                    // new WITH lang mgmt **********
                    var messageS = {};

                    sheetsRows.forEach( (srow) => {
                        //console.log(srow);

                        Object.keys(srow).forEach(function (key) {

                            //console.log(key);
                            //console.log(srow[key]);

                            var currLang = key.replace("WelcomeSentences_","");
                            if (!Array.isArray(messageS[currLang])) { messageS[currLang] = []; } // gestione nuovo oggetto, primo giro.
                            messageS[currLang].push(srow[key]);
                        });
                    });


                    Object.keys(messageS).forEach(function (key) {

                        var finalJson = {"type":0, "lang":"", "speech":[]};

                        finalJson["lang"] = key;
                        finalJson["speech"] = messageS[key];
                        workJSON.responses[0].messages.push(finalJson);
                    });


                    zip.file("mybot/intents/Default Welcome Intent.json", JSON.stringify(workJSON, null, 2));


                    break;
                }

                /* Welcome Intent excel just e list
                 * sheetsRows lista semplice  heetsRows.map((sheetrow)=> {})
                 *
                 * {
                 "id": "#GEN_UUID#",
                 "data": [
                 {
                 "text": "#userSay#",
                 "userDefined": false
                 }
                 ],
                 "isTemplate": false
                 };
                 */
                case (sheetName.search("WELCOMEINTENT-USERSAYS")>=0):{


                    var jsnObj = {};
                    var finArr = [];

                    sheetsRows.forEach( (srow) => {

                        Object.keys(srow).forEach(function (key) {

                            var currLang = key.replace("userSays_","");// key.slice(-2).toLowerCase()

                            if (!Array.isArray(finArr[currLang])) { finArr[currLang] = []; }

                            jsnObj = Object.assign({}, me.get('def_welcintuser'));
                            jsnObj.id=uuid();
                            jsnObj.data.push( { "text": srow[key], "userDefined": false });
                            finArr[currLang].push(jsnObj);
                        });
                    });


                    Object.keys(finArr).forEach(function (key) {
                        zip.file(`/mybot/intents/Default Welcome Intent_usersays_${key}.json`, JSON.stringify(finArr[key],null,2));
                    });


                    /* OLD no lang mgmt
                     let WorkJson=sheetsRows.map((sheetrow)=> {
                     let jsnObj = me.get('def_welcintuser');
                     jsnObj.id=uuid();  jsnObj.data[0].text = sheetrow;
                     return jsnObj;
                     });
                     */



                    //zip.file("mybot/intents/Default Welcome Intent_usersays_en.json", JSON.stringify(WorkJson,null,2));

                    break;}

                /* a sheet for any Intent - there are no possibilities of nested intent, at the moment

                 * todo va migliorato ed ampliato non poco
                 *
                 {
                 "id": "#GEN_UUID#",       ******
                 "name": "#intentName#",   ****** 1. prendi l'oggetto principale e aggiorni
                 "auto": true,
                 "contexts": [],
                 "responses": [             ****** repeat ed aggiorni con i dati di excel
                 {
                 "resetContexts": true,
                 "action": "#intentActionParam#",
                 "affectedContexts": [],
                 "parameters": [    ****** repeat ed aggiorni con i dati di excel
                 {
                 "id": "#GEN_UUID#",
                 "required": true,
                 "dataType": "@#refEntity#",
                 "name": "#parName#",
                 "value": "#parVal#",
                 "isList": false
                 }
                 ],
                 "messages": [],
                 "defaultResponsePlatforms": {},
                 "speech": []
                 }
                 ],
                 "priority": 500000,
                 "webhookUsed": true,
                 "webhookForSlotFilling": false,
                 "fallbackIntent": false,
                 "events": []
                 }

                 ****** secondo template
                 *
                 * uintent_uSays: {
                 "id": "#GEN_UUID#",
                 "data": [
                 {
                 "text": "#userText#",
                 "alias": "#parName#",
                 "meta": "@#refEntity#",
                 "userDefined": true
                 }
                 ],
                 "isTemplate": false,
                 "count": 0
                 }

                 parmDataType	parmName	parmVal	userSays
                 * sheetsRows lista semplice  heetsRows.map((sheetrow)=> {})
                 * JSON.stringify(workJSON,null,2));
                 */

                case (sheetName.search("INTENT-")==0):{


                    var jsnIntent=Object.assign({}, me.get("uintent_h"));
                    var intName =  sheetName.replace("INTENT-","");


                    // template blocco parametri. + //remove the template entry
                    var paramBlktpl = jsnIntent.responses[0].parameters.shift();

                    var pattern = /^userSays/;
                    var matchingKeys = Object.keys(sheetsRows).filter(function(key) {
                        return pattern.test(key);
                    });

                    var lanObj = {};

                    lanObj = matchingKeys.reduce(function(acc, cur, i) {
                        acc[cur] = [];
                        return acc;
                    }, {});




                    sheetsRows.forEach( (irow) => {

                        var curBloc = Object.assign({}, paramBlktpl);
                        curBloc.id=uuid();
                        curBloc.dataType="@"+irow.parmDataType;
                        curBloc.name=irow.parmName;
                        curBloc.value=irow.parmVal;

                        /*sezione user_says - overo il body...*/
                        // Costruisce un array con 1 object per ogni lingua (en, it...)
                        // ogni oggetto è un array di oggetti da inserire nel file corrispondente...
                        // usersays_en ... usersays_it ...


                        matchingKeys.forEach( (langKey) => {


                                // TODO eliminare lo split per usare la notazione  @entity:entity
                                // eventualmente si userà ulteriore sheet...

                                var usayArr = irow[langKey].split(",");

                                usayArr.forEach( (word) => {
                                    //var curUserBloc = Object.assign({}, Jtpls.uintent_uSays_tpl);
                                    var curUserBloc = Object.assign({}, me.get("uintent_uSays"));

                                    /*
                                     TODO per utilizzo di frasi con @entity:entity
                                     curUserBloc.isTemplate=true;
                                     curUserBloc.data[0].text = // intera frase, non andrà + fatto split....
                                     curUserBloc.data[0].userDefined = false;


                                     modificare ANCHE il template, eliminare i valori alias, meta
                                     con la notazione @entity:entity dentro la frase, non servono.

                                     */


                                    curUserBloc.id = uuid();
                                    curUserBloc.data[0].text  = word;
                                    curUserBloc.data[0].alias = irow.parmName;
                                    curUserBloc.data[0].meta = "@"+irow.parmDataType;
                                    lanObj[langKey].push(curUserBloc);
                                });

                            }


                        );


                        // /*sezione user_says*/

                        jsnIntent.responses[0].parameters.push(curBloc);

                    } );


                    // console.log(lanObj);

                    //replace one time vars (header...)

                    jsnIntent.id=uuid();
                    jsnIntent.name = intName;
                    jsnIntent.responses[0].action = intName;
                    // questo corrisponde al parametro "action" inviato con ogni richiesta (gdgACTION, HOWTO_ACTION) ....


                    zip.file("mybot/intents/"+intName+".json", JSON.stringify(jsnIntent,null,2));

                    Object.keys(lanObj).forEach(function (key) {
                        var lanVar = key.replace("userSays_","");
                        zip.file("mybot/intents/"+intName+"_usersays_"+lanVar+".json", lanObj[key].toString());
                    });


                    //return {"intent":jsnIntent, "intentUsersays":lanObj};

                    // OLD NO Lang MGMT

                    /*let intName =  sheetName.replace("INTENT-","");
                     //var intJ = genUserIntentJ(intName,sheetObj.data); intName,irows

                     let jsnIntent=me.get('uintent_h');
                     jsnIntent.id=uuid();
                     jsnIntent.name = intName;
                     jsnIntent.responses[0].action = intName;
                     // questo corrisponde al parametro "action" inviato con ogni richiesta (gdgACTION, HOWTO_ACTION)  ....

                     zip.file(`mybot/intents/${intName}.json`, JSON.stringify(jsnIntent,null,2));


                     // repeat parameterstemplate blocco parametri. + //remove the template entry
                     let paramBlktpl = jsnIntent.responses[0].parameters.shift();
                     let jsIntentUsay=[];

                     jsnIntent.responses[0].parameters=sheetsRows.map( (irow) =>{
                     let workParameter=Object.assign({}, paramBlktpl);
                     workParameter.id=uuid();
                     workParameter.dataType=irow[0];
                     workParameter.name=irow[1];
                     workParameter.value=irow[2];

                     // add data to  jsIntentUsay ... next template
                     let work2 =irow[3].split(",").map( (word) => {
                     return { text:word, alias:irow[1], meta:"@"+irow[0], };

                     });
                     jsIntentUsay=[...(jsIntentUsay  ||[]), ...work2 ];

                     return workParameter;
                     }
                     );


                     jsIntentUsay= jsIntentUsay.map((usersay) => {
                     let curUserBloc = Object.assign({}, me.get("uintent_uSays"));
                     curUserBloc.data=usersay;
                     curUserBloc.id=uuid();
                     return curUserBloc
                     });

                     zip.file(`mybot/intents/${intName}_usersays_en.json`, `[${JSON.stringify(jsIntentUsay, null, 2)}]`);*/


                    break;}
            };
        }); // end loop in  workSheet

        // per ora il default fallback
        var defFallBkJ = me.get('def_fallint_tpl');

        defFallBkJ.id = uuid();

        zip.file("mybot/intents/Default Fallback Intent.json",  JSON.stringify(defFallBkJ,null, 2) );

        // Fisso ?... no, da aggiungere relativo foglio excel con le diverse lingue.
        zip.file("mybot/package.json",  `{ "version": "1.0.0"}` );
        return zip.generateAsync({type:"nodebuffer"});

    }
};

