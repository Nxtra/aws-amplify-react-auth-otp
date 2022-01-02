exports.handler = async (event, context) => {
  console.log(event);
  console.log('This is the sessions array', JSON.stringify(event.request.session));
  if (
    event.request.privateChallengeParameters.answer ===
    event.request.challengeAnswer
  ) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  return event
};
