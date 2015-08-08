# ASKIndigo
Author: Matt Reynolds (matt@mtnlabs.com)

Project: ASKIndigo

Description: Indigo Domotics plugin for the ASK (Alexa Skill Kit) Platform used by the Amazon Echo

Version: 0.0.1b

URL: https://github.com/msreynolds/askindigo

Usage:
```
echo user: "Alexa, ask Indigo to turn off the guest bathroom light"
request: https://somedomain.goprism.com/devices/guest%20bathroom%20light?isOn=0&_method=put
Alexa: "Ok"

echo user: "Alexa, ask Indigo to turn on the guest bedroom heated floor"
request: https://somedomain.goprism.com/devices/guest%20bathroom%20heated%20floor?isOn=1&_method=put
Alexa: "Ok"

echo user: "Alexa, ask Indigo to set the thermostat to 72 degrees"
request: https://somedomain.goprism.com/devices/thermostat?heatpointSet=72&_method=put
Alexa: "Ok"

echo user: "Alexa, ask Indigo to start the sprinklers"
request: https://somedomain.goprism.com/devices/sprinklers?activeZone=run&_method=put
Alexa: "Ok"
```

Instructions:

```
git clone https://github.com/msreynolds/askindigo.git
cd ./askindigo/src
npm install
```

Edit config variables in ```askindigo/src/index.js```

Zip the following contents under ```askindigo/src/``` (The zip MUST NOT include the ```src``` folder)

```
askindigo/src/node_modules
askindigo/src/AlexaSkill.js
askindigo/src/index.js
```

Create a Lambda function called 'ASKIndigo'
Upload Zip file via Amazon Lambda Function console
```
https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/ASKIndigo?tab=code
```

For your sample event, use one of the sample alexa requests found in
```
askindigo/test/alexa_requests.json
```

Edit the file ```askIndigo/speechAssets/SampleUtterances.txt``` with your own device name customizations

Set invocation name to 'indigo' in the Amazon Alexa Developer portal
Copy/Paste the speechAssets contents to their respective Interaction Model places in the Amazon Alexa Developer portal
```
https://developer.amazon.com/edw/home.html
IntentSchema.json
SampleUtterances.txt
```


