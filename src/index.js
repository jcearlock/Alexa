/**
 * Created by Matt Reynolds (matt@mtnlabs.com) on 8/1/15.
 * Mountain Labs, LLC 2015 (mtnlabs.com)
 *
 * Project: ASKIndigo
 * Indigo Domotics plugin for the ASK (Alexa Skill Kit) Platform used by the Amazon Echo
 */

'use strict';

/** the AlexaSkill prototype and helper functions */
var AlexaSkill = require('./AlexaSkill');

/** Indigo Credentials */
var username="indigo username";
var password="indigo password";

/** Indigo Public Hostname */
var hostname="https://some.indigo.domain.com";
var port="80";


/** Device and Action naming conventions */
var upperCaseFirstLetter = false;

var spaceBetweenWords = true;
var dashBetweenWords = false;
var underscoreBetweenWords = false;

/** Variable naming conventions (can not contain spaces or dashes) */
var upperCaseFirstLetterVariable = true;
var underscoreBetweenWordsVariable = false;

/** Variable name speech substitutions */
var currentEnergyUseVariableName = "KWNow";
var sprinklersEnabledVariableName = "sprinklersEnabled";

/** Device name speech substitutions */
var thermostatDeviceName = "thermostat";
var sprinklerDeviceName = "sprinklers";


/** Amazon Echo Skill application Id */
var APP_ID = 'amzn1.echo-sdk-ams.app.[unique-id-here]';


/**
 * ASKIndigo is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */

var ASKIndigo = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
ASKIndigo.prototype = Object.create(AlexaSkill.prototype);
ASKIndigo.prototype.constructor = ASKIndigo;

ASKIndigo.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("ASKIndigo onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

ASKIndigo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("ASKIndigo onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

ASKIndigo.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("ASKIndigo onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

ASKIndigo.prototype.intentHandlers = {
    DeviceChangeIntent: function (intent, session, response) {
        setDevice(intent, session, response);
    },

    GetVariableIntent: function (intent, session, response) {
        getVariable(intent, session, response);
    },

    RunActionIntent: function (intent, session, response) {
        runAction(intent, session, response);
    }
};

/** Create the handler that responds to the Alexa Request. */
exports.handler = function (event, context) {
    var askIndigo = new ASKIndigo();
    askIndigo.execute(event, context);
};

/**
 * Behavior Functions
 */

/** gives the welcome greeting */
function getWelcomeResponse(response) {
    var speechOutput = "Ok, what should Indigo do?";
    var repromptText = "I did not understand you, what should Indigo do?";
    response.ask(speechOutput, repromptText);
}

/** sets a device value */
function setDevice(intent, session, response) {

    var device = getDeviceOrActionName(intent.slots.Device.value, 'device');
    console.log("\n\nDevice: " + device + "\n");

    var requestType = "device";
    var description;
    var urlParameters;
    var path;

    // specific logic to control intentions (binary, numerical, or percent)
    if (intent.slots.Binary && intent.slots.Binary.value) {
        // determine truthy-ness of binary speech component
        var isTrue = isBinaryValueTrue(intent.slots.Binary.value);
        // Sprinkler Logic
        if (device.toLowerCase() === "sprinklers") {
            description = "Turning sprinklers " + (isTrue?"on":"off");
            urlParameters = "?activeZone="+(isTrue?"run":"stop")+"&_method=put";
            path = "/devices/"+sprinklerDeviceName+urlParameters;
        }
        // All other Devices
        else {
            description = "Turning " + device + " " + (isTrue?"On":"Off");
            urlParameters = "?isOn="+(isTrue?"1":"0")+"&_method=put";
            path = "/devices/"+encodeURIComponent(device)+urlParameters;
        }

    }
    else if (intent.slots.Numerical && intent.slots.Numerical.value) {
        // Thermostat Logic
        if (device.toLowerCase() === "thermostat"){
            description = "Setting Thermostat to " + intent.slots.Numerical.value + " degrees";
            // TODO: Use current state of thermostat to determine use of setpointHeat or setpointCool
            //urlParameters = "?setpointCool=" + intent.slots.Numerical.value + "&_method=put";
            urlParameters = "?setpointHeat=" + intent.slots.Numerical.value + "&_method=put";
            path = "/devices/"+thermostatDeviceName+urlParameters;
        }
    }
    else if (intent.slots.Percent && intent.slots.Percent.value) {
        // Dimmer Logic
        description = "Setting Brightness of "+device+" to " + intent.slots.Percent.value+" percent";
        urlParameters = "?brightness="+intent.slots.Percent.value+"&_method=put";
        path = "/devices/"+encodeURIComponent(device)+urlParameters;
    }

    makeRequest(path, description, response, intent.slots.Device.value, requestType);
}

/** runs an action */
function runAction(intent, session, callback) {

    var actionName = getDeviceOrActionName(intent.slots.ActionName.value, 'action');
    console.log("\n\nAction: " + actionName + "\n");
    var requestType = "action";
    var description = "Run Action "+actionName;
    var path = "/actions/"+actionName+"?_method=execute";

    makeRequest(path, description, callback, intent.slots.ActionName.value, requestType);
}

/** request the value of a variable */
function getVariable(intent, session, callback) {

    var variableName = getVariableName(intent.slots.VariableName.value);
    console.log("\n\nVariable: " + variableName + "\n");
    var requestType = "variable";
    var description = "Get variable value "+variableName;
    var urlParameters = "?_method=get";
    var path = "/variables/"+encodeURIComponent(variableName)+".txt"+urlParameters;

    makeRequest(path, description, callback, intent.slots.VariableName.value, requestType);
}

/** returns the value of a variable */
function parseVariableValue(responseData) {
    return responseData.slice(responseData.lastIndexOf("value") + 8).trim();
}



//TODO: Implement device and action caching
//TODO: Create URL Encoded acceptable variants array for 'device'/'action' variable(s)
//TODO: Find the existing device with the closest name
//TODO: Ensure device capability before executing
//var currentDevicesCache = [];
//var currentActionsCache = [];

/**
 * Utility Functions
 */

/** create http request to automation server */
function makeRequest( path, description, response, slotValue, requestType) {
    console.log("\n\n" + description + "\n");
    console.log("\n\nMaking request: " + hostname+path + "\n");

    var digestRequest = require('request-digest')(username, password);
    digestRequest.request({
        host: hostname,
        path: path,
        port: port,
        method: 'GET'
    }, function (error, res, body) {
        response.tell(getSpeechOutput(error, res, body, slotValue, requestType));
    });
}


/** returns the proper speech output */
function getSpeechOutput(error, response, body, slotValue, requestType) {

    if (error) {
        return "There was an error";
    }

    var result = "Ok";

    if (requestType === "variable") {
        result = slotValue + " is " + parseVariableValue(body);
    }
    else if (requestType === "action") {
        // TODO: parse html response body for errors
    }
    else if (requestType === "device") {
        // TODO: parse html response body for errors
    }

    return result;
}

/** returns a proper Device or Action name */
function getDeviceOrActionName(input, requestType) {
    var result = getCaseAndDilimitedString(input, requestType);
    return result;
}

/** returns a proper variable name */
function getVariableName(input) {

    // Special cases for certain variable names
    if (input === 'current energy use')
    {
        return currentEnergyUseVariableName;
    }
    else if (input === 'sprinklers enabled') {
        return sprinklersEnabledVariableName;
    }

    var result = getCaseAndDilimitedString(input, 'variable');
    return result;
}


/** returns a boolean representation of a binary speech element */
function isBinaryValueTrue(binaryValue) {

    binaryValue = binaryValue.toLowerCase();

    var isTrue =
        (binaryValue === 'true' ||
        binaryValue === '1'    ||
        binaryValue === 'one'  ||
        binaryValue === 'on'   ||
        binaryValue === 'start' ||
        binaryValue === 'resume' ||
        binaryValue === 'activate' ||
        binaryValue === 'run' ||
        binaryValue === 'play'
        );

    return isTrue;
}

/** returns a string with the proper case and delimiter */
function getCaseAndDilimitedString(lowerCaseWithSpacesBetweenWords, requestType) {
    var result = lowerCaseWithSpacesBetweenWords;

    if (requestType === 'variable') {
        if (upperCaseFirstLetterVariable) {
            result = upperCaseFirstLetterOfEachWord(result);
        }

        // replace spaces with underscore or empty string
        if (underscoreBetweenWordsVariable) {
            result = result.replace(/ /g, "_");
        }
        else {
            result = result.replace(/ /g, "");
        }
    }
    else {
        if (upperCaseFirstLetter) {
            result = upperCaseFirstLetterOfEachWord(result);
        }

        // replace spaces with dashes, underscores, empty strings
        if (dashBetweenWords) {
            result = result.replace(/ /g,"-");
        }
        else if (underscoreBetweenWords) {
            result = result.replace(/ /g,"_");
        }
        else if (!spaceBetweenWords) {
            result = result.replace(/ /g,"");
        }
        // otherwise leave the spaces
    }

    return result;
}

/** returns the input parameter with all first letters upper cased */
function upperCaseFirstLetterOfEachWord(input)
{
    var pieces = input.split(" ");

    for ( var i = 0; i < pieces.length; i++ )
    {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
    }

    return pieces.join(" ");
}