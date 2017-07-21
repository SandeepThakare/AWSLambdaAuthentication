'use strict';

// Require the AWS SDK and get the instance of our DynamoDB
var aws = require('aws-sdk');
var db = new aws.DynamoDB();

// Set up the model for our the email
var model = {
  emails: {"S" : ""},
};

// This will be the function called when our Lambda function is exectued
exports.handler = (event, context, callback) => {

  // We'll use the same response we used in our Webtask
  debugger;
  const RESPONSE = {
    OK : {
      statusCode : 200,
      message: "You have successfully subscribed to the newsletter!",
    },
    DUPLICATE : {
      status : 400,
      message : "You are already subscribed."
    },
    ERROR : {
      status : 400,
      message: "Something went wrong. Please try again."
    }
  };

  // Capture the email from our POST request
  // For now, we'll just set a fake email
  console.log(event.emails);
  var emails = event.emails;

  if(!emails){
    // If we don't get an email, we'll end our execution and send an error
    return callback(null, RESPONSE.ERROR);
  }

  // If we do have an email, we'll set it to our model
  model.emails.S = emails;

  // Insert the email into the database, but only if the email does not already exist.
  db.putItem({
    TableName: 'Emails',
    Item: model,
    Expected: {
      emails: { Exists: false }
    }
  }, function (err, data) {
    if (err) {
      // If we get an err, we'll assume it's a duplicate email and send an
      // appropriate message
      return callback(null, RESPONSE.DUPLICATE);
    }
    // If the data was stored succesfully, we'll respond accordingly
    callback(null, RESPONSE.OK);
  });
};