exports.handler = function(request, context) {
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        log("DEGUG:", "Discover request", JSON.stringify(request));
        handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController') {
        if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
            log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
            handlePowerControl(request, context);
        }
    }

    function handleDiscovery(request, context) {
        var payload = {
            "endpoints": [
		{
                    "endpointId": "light",
                    "manufacturerName": "Smart Device Company",
                    "friendlyName": "電気",
                    "description": "smart switch for light",
                    "displayCategories": ["SWITCH"],
                    "cookie": {},
                    "capabilities": [
			{
                            "type": "AlexaInterface",
                            "interface": "Alexa",
                            "version": "3"
			},
			{
			    "interface": "Alexa.PowerController",
			    "version": "3",
			    "type": "AlexaInterface",
			    "properties": {
				"supported": [{ "name": "powerState" }],
				"retrievable": true
			    }
			}
		    ]
		},
		{
                    "endpointId": "aircon",
                    "manufacturerName": "Smart Device Company",
                    "friendlyName": "エアコン",
                    "description": "smart switch for aircon",
                    "displayCategories": ["SWITCH"],
                    "cookie": {},
                    "capabilities": [
			{
                            "type": "AlexaInterface",
                            "interface": "Alexa",
                            "version": "3"
			},
			{
			    "interface": "Alexa.PowerController",
			    "version": "3",
			    "type": "AlexaInterface",
			    "properties": {
				"supported": [{ "name": "powerState" }],
				"retrievable": true
			    }
			}
		    ]
		}
	    ]
        };
        var header = request.directive.header;
        header.name = "Discover.Response";
        log("DEBUG", "Discovery Response: ", JSON.stringify({ header: header, payload: payload }));
        context.succeed({ event: { header: header, payload: payload } });
    }

    function log(message, message1, message2) {
        console.log(message + message1 + message2);
    }

    function handlePowerControl(request, context) {
        // get device ID passed in during discovery
        var requestMethod = request.directive.header.name;
        // get user token pass in request
        var requestToken = request.directive.endpoint.scope.token;
	// get endpointId
	var endpointId = request.directive.endpoint.endpointId;
        var powerResult;

	if (requestMethod === "TurnOn") {
            // Make the call to your device cloud for control 
            // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
            powerResult = "ON";
        }
        else if (requestMethod === "TurnOff") {
            // Make the call to your device cloud for control and check for success 
            // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
            powerResult = "OFF";
        }

	var mqtt = require('mqtt');
	var mqttpromise = new Promise( function(resolve,reject){
	    var options = {
		port: xxxxx,
		clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
		username: "username",
		password: "password",
	    };
	    var client  = mqtt.connect('mqtt://XXX.cloudmqtt.com', options);
	    
	    client.on('connect', function() { // When connected
		// publish a message to any mqtt topic
		client.publish(endpointId, powerResult);
		client.end();
		resolve('Done Sending');
	    });
	    
	});
	mqttpromise.then(
	    function(data) {
		console.log('Function called succesfully:', data);
		var response = {
		    "context": {
			"properties": [{
			    "namespace": "Alexa.PowerController",
			    "name": "powerState",
			    "value": powerResult,
			    "timeOfSample": "2017-02-03T16:20:50.52Z",
			    "uncertaintyInMilliseconds": 500
			}]
		    },
		    "event": {
			"header": {
			    "namespace": "Alexa",
			    "name": "Response",
			    "payloadVersion": "3",
			    "messageId": "something",
			    "correlationToken": "something"
			},
			"payload": {}
		    }
		};


		log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
		return context.succeed(response);
	    },
	    function(err) {
		console.log('An error occurred:', err);
	    }
	);	
    }
};
