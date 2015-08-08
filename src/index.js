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

/** Specific Device names used in speech */
var thermostatDeviceName = "Thermostat";
var sprinklerDeviceName = "Sprinklers";

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
    RunActionIntent: function (intent, session, response) {
        runAction(intent, session, response);
    },

    DeviceChangeIntent: function (intent, session, response) {
        setDevice(intent, session, response);
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
    var repromptText = "I did not understand you, please try again.";
    response.ask(speechOutput, repromptText);
}

/** sets a device value */
function setDevice(intent, session, response) {

    var device = intent.slots.Device.value;
    console.log("\n\nDevice: " + device + "\n");

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

    makeRequest(path,description,response);
}

/** runs an action */
function runAction(intent, session, callback) {

    var actionName = intent.slots.ActionName.value;
    console.log("\n\nAction: " + actionName + "\n");

    var description = "Run Action "+actionName;
    var path = "/actions/"+actionName+"?_method=execute";

    makeRequest(path,description,callback);
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
function makeRequest( path, description, response) {

    var speechOutput = "";

    console.log("\n\n" + description + "\n");
    console.log("\n\nMaking request: " + hostname+path + "\n");

    var digestRequest = require('request-digest')(username, password);
    digestRequest.request({
        host: hostname,
        path: path,
        port: port,
        method: 'GET'
    }, function (error, res, body) {
        if (error) {
            console.log("\n\nError: " + error.message + "\n");
            speechOutput = "There was an error";
            response.tell(speechOutput);
            throw error;
        }
        else if (res) {
            console.log("\n\nResponse: " + res.toString() + "\n");
            speechOutput = "Ok";
            response.tell(speechOutput);
        }
        else if (body) {
            console.log("\n\nBody: " + body.toString() + "\n");
            speechOutput = "Ok";
            response.tell(speechOutput);
        }
    });
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