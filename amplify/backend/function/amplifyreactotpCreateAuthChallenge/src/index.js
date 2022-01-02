/* tslint:disable */
/* eslint-disable */
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: process.env.REGION});

exports.handler = async (event, context, callback) => {
  //Create a random number for otp
  let secretLoginCode 
  const phoneNumber = event.request.userAttributes.phone_number;

  //For Debugging
  console.log(event, context);
  console.log('This is the sessions array', JSON.stringify(event.request.session));

  if (!event.request.session || !event.request.session.length) {
      // This is a new auth session
      // Generate a new secret login code and mail it to the user
      secretLoginCode = Math.random().toString(10).substr(2, 6);
  } else {
      // There's an existing session. Don't generate new digits but
      // re-use the code from the current session. This allows the user to
      // make a mistake when keying in the code and to then retry, rather
      // then needing to e-mail the user an all new code again.    
      const previousChallenge = event.request.session.slice(-1)[0];
      secretLoginCode = previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
  }

  await sendSms(phoneNumber, secretLoginCode)

  //set return params
  event.response.privateChallengeParameters = {};
  event.response.privateChallengeParameters.answer = secretLoginCode;

  // Add the secret login code to the session so it is available
  // in a next invocation of the "Create Auth Challenge" trigger
  event.response.challengeMetadata = `CODE-${secretLoginCode}`;

  return event
};

const sendSms = async(phoneNumber, secretLoginCode) => {
  // await sns.publish(
  //   {
  //     Message: 'your otp: ' + secretLoginCode,
  //     PhoneNumber: phoneNumber,
  //     MessageStructure: 'string',
  //     MessageAttributes: {
  //       'AWS.SNS.SMS.SenderID': {
  //         DataType: 'String',
  //         StringValue: 'AMPLIFY',
  //       },
  //       'AWS.SNS.SMS.SMSType': {
  //         DataType: 'String',
  //         StringValue: 'Transactional',
  //       },
  //     },
  //   }
  // ).promise();
  console.log(`SMS sent to ${phoneNumber} and otp = ${secretLoginCode}`)
}