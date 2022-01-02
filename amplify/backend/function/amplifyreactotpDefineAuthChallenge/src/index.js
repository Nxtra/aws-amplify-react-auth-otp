// exports.handler = (event, context) => {
//   //For Debugging
//   console.log(event, context);
//   console.log('This is the sessions array', JSON.stringify(event.request.session));
//   if (event.request.session.length === 0) {
//     event.response.issueTokens = false;
//     event.response.failAuthentication = false;
//     event.response.challengeName = 'CUSTOM_CHALLENGE';
//   } else if (
//     event.request.session.length === 1 &&
//     event.request.session[0].challengeName === 'CUSTOM_CHALLENGE' &&
//     event.request.session[0].challengeResult === true
//   ) {
//     event.response.issueTokens = true;
//     event.response.failAuthentication = false;
//   } else {
//     event.response.issueTokens = false;
//     event.response.failAuthentication = true;
//   }
//   // context.done(null, event);
  // console.log("Returning event as follows: ", event)
//   return event
// };

exports.handler = async (event, context, callback) => {
  console.log(event.request);
    console.log('This is the sessions array', JSON.stringify(event.request.session));
  
  // If user is not registered
  if (event.request.userNotFound) {
      event.response.issueToken = false;
      event.response.failAuthentication = true;
      throw new Error("User does not exist");
  }
  
  if (event.request.session.length >= 3 && event.request.session.slice(-1)[0].challengeResult === false) { // wrong OTP even After 3 sessions?
      event.response.issueToken = false;
      event.response.failAuthentication = true;
      throw new Error("Invalid OTP");
  } else if (event.request.session.length > 0 && event.request.session.slice(-1)[0].challengeResult === true) { // Correct OTP!
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
  } else { // not yet received correct OTP
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = 'CUSTOM_CHALLENGE';
  }
  
  console.log("Returning event as follows: ", event)
  return event;
};