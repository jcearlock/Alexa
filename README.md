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

Step 1) Prepare your own source code to upload to the Amazon Lambda Function console:

Get the codez, cd into project directory
```
git clone https://github.com/msreynolds/askindigo.git
cd askindigo
```

Edit all configuration variables in ```./src/index.js```
```
/** Indigo Credentials */
var username="indigo username";
var password="indigo password";

/** Indigo Public Hostname */
var hostname="https://yourcname.goprism.com";
var port="80";

/** Device and Action naming conventions */
// set to true if you use upper case names (Foo Item Name)
// set to false if you use lower case names (foo item name)
var upperCaseFirstLetter = false; 

var spaceBetweenWords = true;
var dashBetweenWords = false;
var underscoreBetweenWords = false;

/** Specific Device names used in speech */
// ex. device name is 'nest', you say 'thermostat', command uses 'nest'
var thermostatDeviceName = "nest";

// ex. device name is 'ir-master-pro', you say 'sprinklers', command uses 'ir-master-pro'
var sprinklerDeviceName = "ir-master-pro"; 

/** Amazon Echo Skill application Id */
var APP_ID = 'amzn1.echo-sdk-ams.app.youramazonapplicationid';

```

Build the zip file you will upload to Amazon Lambda Function Console, the zip file is stored in ```./dist/askIndigo.zip```:

```
chmod 775 ./build.sh
./build.sh
```



Step 2) Create your 'ASKIndigo' Alexa Skill in the Amazon Developer Console:

Go to ```https://developer.amazon.com/edw/home.html```

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonDevelopmentConsole-Step1-ASKIndigo-CreateSkill.png)


Step 3) Edit the skil, Set invocation name to 'indigo' (or whatever you like) in the Amazon Alexa Developer Console:

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonDevelopmentConsole-Step2-ASKIndigo-SkillInformation.png)


Step 4) 
Copy/Paste the contents of ```askIndigo/speechAssets/IntentSchema.json``` into the appropriate section of the Interaction Model in the Amazon Developer Console:

Edit the file ```askIndigo/speechAssets/SampleUtterances.txt``` with your own device name customizations.  Copy/Paste the contents into the appropriate section of the Interaction Model in the Amazon Developer Console:

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonDevelopmentConsole-Step3-ASKIndigo-InteractionModel.png)

You DO NOT need to complete the last step labeled 'Publishing Information':

PLEASE DO NOT PUBLISH THIS SKILL IN YOUR NAME
![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonDevelopmentConsole-Step4-ASKIndigo-Test.png)


Step 5) Create an AWS Role that your Lambda Function will run as:



Step 6) Create a Lambda function called 'ASKIndigo' in the Amazon Lambda Function Console:

Go to ```https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions```

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step0-ASKIndigoFunction.png)

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step0b-ASKIndigoFunction.png)



Step 7) Name your Lambda function, select the ```./dist/askIndigo.zip``` to Upload, Select your AWS Role, Set Timeout:

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step0c-ASKIndigoFunction.png)


Step 8) Test your Skill:

To test your skill, you use fake Alexa request payloads called Sample Events, in JSON format.

Edit the file ```askindigo/test/alexa_requests.json``` with your own Alexa Skill Application ID.

For your Sample Event, Copy/Paste the contents from one of the examples found in this file.




After the first time you create your ASKIndigo Skill, editing the Skill will look like the following:

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step1-ASKIndigoFunction.png)

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step2-ASKIndigoFunction.png)

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step2b-ASKIndigoFunction.png)

![alt tag](https://github.com/msreynolds/askIndigo/blob/master/help/AmazonLambdaConsole-Step3-ASKIndigoFunction.png)




