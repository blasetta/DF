 "use strict";
/**
 * Templates JSON for various appls
 */
const uuid = require('uuid/v4');
const _ = require ('underscore');
let standard_suggestions={};

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
                "messages": [ ],
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
                "messages": [],
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
        "contexts": [],
        "responses": [
            {
                "resetContexts": false,
                "action": "#intentActionParam#",
                "affectedContexts": [],
                "parameters": [
                    {
                        "id": "#GEN_UUID#",
                        "required": false,
                        "dataType": "@#refEntity#",
                        "name": "#parName#",
                        "value": "#parVal#",
                        "isList": false,
                        "prompts": []

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

    uintent_resp: {
        "id": "#GEN_UUID#",
        "name": "#intentName#",
        "auto": true,
        "contexts": [],
        "responses": [
            {
                "resetContexts": false,
                "action": "#intentActionParam#",
                "affectedContexts": [],
                "parameters": [],
                "messages": [],
                "defaultResponsePlatforms": {},
                "speech": []
            }
        ],
        "priority": 500000,
        "webhookUsed": false,
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
    },

    // template per intent training phrases
    // sarà utilizzato per frasi con notazione esplicita delle entity
    // es:  Ciao, vorrei qualche @infoTypeSyn:infoTypeSyn relative a @contSyn:contSyn
    uintent_uSaysV2: {
        "id": "#GEN_UUID#",
        "data": [
            {
                "text": "#userText#",
                "userDefined": false
            }
        ],
        "isTemplate": true,
        "count": 0
    }

    /* Template for response to Dialogflow and ActiononGoogle ver.1 and ver. 2*/
    , basicResponse_1: {
        "speech": "#speech#",
        "displayText": "#speech#",
        "messages": [],
        "data": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": []
                } 
                
            },
            "telegram": { "text": "",
                "parse_mode": "HTML",
                "reply_markup": {}
            },
            "contextOut": ""
            ,
            "source": "myurl.com"
        }
    }

    , carouselItem_1 :  {
    "title": "Title of item 1",
    "description": "Description of item 1",
    "footer": "Item 1 footer",
    "image": {
        "url": "https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png",
        "accessibilityText": "Google Assistant Bubbles"
    },
    "openUrlAction": {
        "url": "https://www.google.com",
        "urlTypeHint": "URL_TYPE_HINT_UNSPECIFIED"
    }
},
            basicCard_1 : {
              "title": "Card Title",
              "subtitle": "",
               "formattedText": "",
              "image": {
                "url": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
                "accessibilityText": "Google Assistant"
              },
              "buttons": [
                {
                  "title": "Button Title",
                  "openUrlAction": {
                    "url": "https://www.google.com"
                  }
                }
              ],
              "imageDisplayOptions": "WHITE"
            }
       ,alexaRes:{
        "version": "1.0",
        "sessionAttributes": {
            "supportedHoriscopePeriods": {
                "daily": true,
                "weekly": false,
                "monthly": false
            }
        },
        "response": {
            "outputSpeech": {
                "type": "PlainText",
                "text": "text"
            },
            "card": {
                "type": "Simple",
                "title": "Horoscope",
                "content": "text"
            },
            "reprompt": {
                "outputSpeech": {
                    "type": "PlainText",
                    "text": "reprompt"
                }
            },
            "shouldEndSession": false
        }
    }



};




module.exports = {
  get: function(code) {
    return JSON.parse(JSON.stringify(T[code]));
      
  }
  , CreateArchive(workSheet) {

    const JSZip = require("jszip");
    var zip = new JSZip(), me=this;
        var agentname='mybot';

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
            case (sheetName.search("AGENT")==0):{

                let workJSON=me.get('agent'); // get the template



                /*Aggiunte saverio - Aggiunta sezione per lang e supportedlang + puntamenti con nome dato nello sheet.*/
                workJSON.description=sheetsRows[0].description;
                workJSON.googleAssistant.project=sheetsRows[0].projectid;
                workJSON.webhook.url=sheetsRows[0].fullfillment_url;

                List_Languages.push(workJSON.language);
                    if (sheetsRows[0].code && sheetsRows[0].code.length>0) agentname=sheetsRows[0].code;

                workJSON.language = sheetsRows[0].DEF_LANG;
                    if (sheetsRows[0].SUPP_LANG) {
                        workJSON.supportedLanguages =  sheetsRows[0].SUPP_LANG.split(",").map( clang => clang.trim());
                        List_Languages=[List_Languages, ...workJSON.supportedLanguages]; // todo check inside loops
                    }

                // Creates the file agent.json
                    zip.file(agentname+"/agent.json", JSON.stringify(workJSON,null,2)); //prettyprint

                break;
            }

            /* ENTITY


             There may be many entities sheet ... name is in the sheet label

             */
            case (sheetName.search("ENTITY")==0):{

                /* Header */
                let workHeader =me.get('entities_h'); //jsnH
                let entitiName=sheetName.replace("ENTITY-","");
                workHeader.id=uuid();
                workHeader.name=entitiName;

                    zip.file(`${agentname}/entities/${workHeader.name}.json`, JSON.stringify(workHeader,null, 2));



                /*Aggiunto Saverio.
                Gestione multi lingua
                per ogni riga, analizzo colonna x colonna
                prendo i dati dalle colonne relative, ed esamino i "Lang" dalle colonne relative.*/

                    let jsnDarr = [];

                sheetsRows.forEach( (erow) => {

                Object.keys(erow).forEach( (key) => { 
                  
                  if (key!="ent_val") {
                     var currLang = key.replace("ent_syn_","");

                    if(!Array.isArray(jsnDarr[currLang])) { jsnDarr[currLang] = [] };                              

                    var Workdetail =  me.get('entities_def');
                    Workdetail.value=erow.ent_val;
                    Workdetail.synonyms = erow["ent_syn_"+currLang].split(",");
                    jsnDarr[currLang].push(Workdetail);


                  }

                }
                );
              });

                Object.keys(jsnDarr).forEach(function (key) {                     
                        zip.file(`${agentname}/entities/${entitiName}_entries_${key}.json`, JSON.stringify(jsnDarr[key],null, 2));
                    });


                break;}

            /* Default Welcome Intent - very simple - messages + suggestions (bottons in Assistant) */

            case (sheetName.search("WELCOMEINTENT-DEF")==0): {
                let workJSON = me.get('def_welcint');

                workJSON.id = uuid();



                /* Message and suggestions with locales
                 */
                var messageS = {}, suggestions={};

                sheetsRows.forEach( (srow) => {
                    //console.log(srow);

                    Object.keys(srow).forEach(function (key) {
                        // langualge todo check
                        let currLang =key.slice(-2).toLowerCase();


                        // Welcome Sentence in messages
                        if (key.toLowerCase().indexOf("welcomesentences_")>=0) {

                            if (!Array.isArray(messageS[currLang])) { messageS[currLang] = []; } // gestione nuovo oggetto, primo giro.
                            messageS[currLang].push(srow[key]);
                        }

                        // Suggestions
                        if (key.toLowerCase().indexOf("suggestions_")>=0) {
                            const wsuggestions=srow[key].split(",").map( csug => { return {"title":csug.trim()}});
                            suggestions[currLang]=[...suggestions[currLang]||[], ...wsuggestions];
                        }
                    });


                }); // end loop

                if (!_.isEmpty(suggestions)) {
                    let mytempl=`{"type": "suggestion_chips","platform": "google", "lang": "$[this.locale]$", "suggestions": 0 }` ;
                    let dyntempl=function(templateString, templateVars) {
                        let escF = function escapeRegExp(str) {
                            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                        };
                        // replace
                        const newT = templateString.replace(new RegExp(escF("$["), 'g'), "${").replace(new RegExp(escF("]$"), 'g'), "}");
                        return new Function("return `" + newT + "`;").call(templateVars);
                    };

                    // Suggestions
                    _.each(suggestions, (sugroup,locale) => {
                        let mynewjson=JSON.parse(dyntempl(mytempl,{"locale":locale}));
                        mynewjson.suggestions=_.uniq(sugroup);
                        standard_suggestions[locale]=mynewjson;

                        workJSON.responses[0].messages.push(mynewjson);

                    });
                }


                /* end insert  */
                Object.keys(messageS).forEach(function (key) {

                var finalJson = {"type":0, "lang":"", "speech":[]};

                finalJson["lang"] = key;
                finalJson["speech"] = messageS[key];
                workJSON.responses[0].messages.push(finalJson);
                });


                    zip.file(`${agentname}/intents/Default Welcome Intent.json`, JSON.stringify(workJSON, null, 2));


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
            case (sheetName.search("WELCOMEINTENT-USERSAYS")==0):{

            
                var jsnObj = {};               
                var finArr = [];

                sheetsRows.forEach( (srow) => {

                Object.keys(srow).forEach(function (key) {                  

                            var currLang = key.replace("userSays_","");// key.slice(-2).toLowerCase()

                          if (!Array.isArray(finArr[currLang])) { finArr[currLang] = []; }
                         
                          //jsnObj = Object.assign({}, me.get('def_welcintuser'));
                          jsnObj = me.get('def_welcintuser');
                         
                          jsnObj.id=uuid();
                          jsnObj.data.push( { "text": srow[key], "userDefined": false });
                          finArr[currLang].push(JSON.stringify(jsnObj,null,2));
                      });                        
                });


                Object.keys(finArr).forEach(function (key) {                                                             
                      zip.file(`${agentname}/intents/Default Welcome Intent_usersays_${key}.json`, "["+finArr[key].toString()+"]");                      
                });

                break;}

            /*fallback*/
            case (sheetName.search("FALLBACK-DEF")==0): {
                let workJSON = me.get('def_fallint');

                workJSON.id = uuid();

                // OLD without Lang mgmt
                // workJSON.responses[0].messages[0].speech = sheetsRows;



                // new WITH lang mgmt **********
                var messageS = {}, suggestions={};

                sheetsRows.forEach( (srow) => {
                    //console.log(srow);

                    Object.keys(srow).forEach(function (key) {
                        // language todo check
                        let currLang =key.slice(-2).toLowerCase();

                        if (key.toLowerCase().indexOf("fallbacksentence")>=0) {

                            if (!Array.isArray(messageS[currLang])) { messageS[currLang] = []; } // gestione nuovo oggetto, primo giro.
                            messageS[currLang].push(srow[key]);
                        }

                        // Suggestions
                        if (key.toLowerCase().indexOf("suggestions_")>=0) {
                            const wsuggestions=srow[key].split(",").map( csug => { return {"title":csug.trim()}});
                            suggestions[currLang]=[...suggestions[currLang]||[], ...wsuggestions];
                        }


                    });
                });// end loop

                if (!_.isEmpty(suggestions)) {
                    let mytempl = `{"type": "suggestion_chips","platform": "google", "lang": "$[this.locale]$", "suggestions": 0 }`;
                    let dyntempl = function (templateString, templateVars) {
                        let escF = function escapeRegExp(str) {
                            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                        };
                        // replace
                        const newT = templateString.replace(new RegExp(escF("$["), 'g'), "${").replace(new RegExp(escF("]$"), 'g'), "}");
                        return new Function("return `" + newT + "`;").call(templateVars);
                    };

                    // Suggestions
                    _.each(suggestions, (sugroup, locale) => {
                        let mynewjson = JSON.parse(dyntempl(mytempl, {"locale": locale}));
                        mynewjson.suggestions = _.uniq(sugroup);
                        standard_suggestions[locale] = mynewjson;

                        workJSON.responses[0].messages.push(mynewjson);

                    });
                }


                Object.keys(messageS).forEach(function (key) {

                    var finalJson = {"type":0, "lang":"", "speech":[]};

                    finalJson["lang"] = key;
                    finalJson["speech"] = messageS[key];
                    workJSON.responses[0].messages.push(finalJson);
                });



                zip.file(`${agentname}/intents/Default Fallback Intent.json`,  JSON.stringify(workJSON,null, 2) );
                //console.log(JSON.stringify(workJSON, null, 2));

                break;
            }
            /*fallback*/

            /* a sheet for any Intent - there are no possibilities of nested intent, at the moment


             */
            case (sheetName.search("INTENT-")==0):{

             


                var jsnIntent =   me.get('uintent_h');
                var intName =  sheetName.replace("INTENT-","");
                

                // template blocco parametri. + //remove the template entry
                var paramBlktpl = jsnIntent.responses[0].parameters.shift();        

                var pattern = /^missing_/;
                var matchingKeys = Object.keys(sheetsRows[0]).filter(function(key) {
                                             return pattern.test(key);
                                        });
                


                sheetsRows.forEach( (irow) => {

                  
                    var curBloc = JSON.parse(JSON.stringify(paramBlktpl));  
                    curBloc.id=uuid();
                    curBloc.dataType="@"+irow.parmDataType;
                    curBloc.name=irow.parmName;
                    curBloc.value=irow.parmVal;

                    curBloc.isList = irow.isList;
                    curBloc.required = irow.required;

                    matchingKeys.forEach( (k) => {

                      var promtObj = { "lang" : k.replace("missing_","")  , "value" : irow[k]  };

                      curBloc.prompts.push(promtObj);

                    } );

                    



                     jsnIntent.responses[0].parameters.push(curBloc);

                } );


             //console.log( JSON.stringify(jsnIntent,null,2));  

            //replace one time vars (header...)

                jsnIntent.id=uuid();
                jsnIntent.name = intName;
                jsnIntent.responses[0].action = intName;
                // questo corrisponde al parametro "action" inviato con ogni richiesta (gdgACTION, HOWTO_ACTION) ....


                    zip.file(`${agentname}/intents/${intName}.json`, JSON.stringify(jsnIntent,null,2));

             


                break;
                }

                case (sheetName.search("INTENTRESP-")==0): {
                    let workJSON = me.get("uintent_resp");
                    var intName =  sheetName.replace("INTENTRESP-","");


                    workJSON.id = uuid();
                    workJSON.responses[0].action = intName;
                    workJSON.name = intName;


                    // new WITH lang mgmt **********
                    var messageS = {};

                    sheetsRows.forEach( (srow) => {
                        //console.log(srow);

                        Object.keys(srow).forEach(function (key) {

                            //console.log(key);
                            //console.log(srow[key]);

                            var currLang = key.replace("Messages_","");
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

                    // Standard suggestions

                    if (!_.isEmpty(standard_suggestions)) _.each(standard_suggestions, ( sugg,locale) =>{
                        workJSON.responses[0].messages.push(sugg);
                    });


                    zip.file(`${agentname}/intents/${intName}.json`, JSON.stringify(workJSON,null,2));


                    break;
                }

              // botFillerV2 id     1UQoi4oalFHzATAdsa_NDhiFQsglEKQDN
              //http://localhost:5000/newDFArchive?driveid=1UQoi4oalFHzATAdsa_NDhiFQsglEKQDN
              case (sheetName.search("INTENTRAIN-")==0):{

                
                var intName =  sheetName.replace("INTENTRAIN-","");
                var messageS = {};

                sheetsRows.forEach( (irow) => {
                 
                  Object.keys(irow).forEach(function (key) {     

                    let lanVar = key.replace("userSays_","");

                    let intUsay_obj = me.get("uintent_uSaysV2");


                    intUsay_obj.id=uuid();
                    intUsay_obj.data[0].text = irow[key];

                      if (!Array.isArray(messageS[lanVar])) { messageS[lanVar] = []; } // gestione nuovo oggetto, primo giro.
                      
                      messageS[lanVar].push(intUsay_obj);

                  });

                } );

                 Object.keys(messageS).forEach(function (key) {
                    
                        zip.file(`${agentname}/intents/${intName}_usersays_${key}.json`, JSON.stringify(messageS[key],null, 2));
                });


              }  // end case sheetName.search("INTENTRAIN

        };
    }); // end loop in  workSheet


    // Fisso ?... no, da aggiungere relativo foglio excel con le diverse lingue.
        zip.file(`${agentname}/package.json`,  `{ "version": "1.0.0"}` );
    return zip.generateAsync({type:"nodebuffer"});

}
};


/**
 * Created by saveriopugliese on 17/05/18.
 */


