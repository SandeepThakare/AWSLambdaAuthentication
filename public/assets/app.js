//var apigClientFactory = require('aws-api-gateway-client');

AWS.config.region = '*******'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '<Your Identity Pool ID>',
    Logins: {
      '<Your Cognito ARN>': JSON.parse(localStorage.getItem('token'))
    }
});

$(document).ready(function(){
  updateAuthenticationStatus();
  loadAdmin();
});
function logout(){
  localStorage.clear();
  window.location = '/';
};

function updateAuthenticationStatus(){
  $('#user').empty();
  $('#login').empty();
  var user = localStorage.getItem('token');
  if(user){
    $('#user').show().append('<a onclick="logout()">Log out</a>');
    $('#login').hide();
    $('#signup').hide();
  } else {
    $('#login').show().append('<a href="/login">Log In</a>');
    //$('#signup').show().append('<a href="/signup">Sign Up</a>');
    $('#user').hide();
    //$('#signup').hide();
  }
}

function loadAdmin(){
  if(window.location.pathname == '/admin/'){
    if(localStorage.getItem('token')){
      AWS.config.credentials.get(function (err) {
        var client = apigClientFactory.newClient({
          accessKey: AWS.config.credentials.accessKeyId, 
          secretKey: AWS.config.credentials.secretAccessKey, 
          sessionToken: AWS.config.credentials.sessionToken,
          region: 'us-west-2'  
        });
        client.subscribersGet().then(function(data){
          for(var i = 0; i < data.data.message.length; i++){
            $('#subscribers').append('<h4>' + data.data.message[i].emails + '</h4>');
          }
        });
      });
    } else {
      window.location = '/';
    }
  }
}

$('#newsletter').submit(function(e){
  e.preventDefault();

  //your api key from cognito
  var client = apigClientFactory.newClient({apiKey: '**********************************'});

  var email=$('#emails').val();
  console.log(email);
  var c = client.subscribePost({}, {emails:email}, {})
  .then(function(data){
    console.log(data.data);
    console.log(data.data.statusCode);
    if(data.status == 200){
      $('#newsletter').hide();
      $('#response').append('<div class="alert alert-success">'+ data.data.message +'</div>')
    } else {
      $('#newsletter').hide();
      $('#response').append('<div class="alert alert-danger">'+ data.data.message +'</div>')
    }
  })

})

$('#signup').submit(function(e, data){
  e.preventDefault();
  AWSCognito.config.region = '*********';
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '***************************************'
  });
  // Need to provide placeholder keys unless unauthorised user access is enabled for user pool
  AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'});

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({ 
      UserPoolId : '********************',
      ClientId : '*************************'
  });

   var attributeList = [];
    
  //   var dataUserName = {
  //       Name : 'username',
  //       Value : $('#username').val()
  //   };
  //   var dataPassword = {
  //       Name : 'password',
  //       Value : $('#password').val()
  //   };

  //   var attributeUserName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataUserName);
  //   var attributePassword = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPassword);

  //   attributeList.push(attributeUserName);
  //   attributeList.push(attributePassword);

    var dataEmail = {
        Name : 'email',
        Value : $('#email').val()
    };
    var dataPhoneNumber = {
        Name : 'phone_number',
        Value : '+1554477454'
    };
    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);

    userPool.signUp($('#username').val(), $('#password').val(), attributeList, null, function(err, result){
        if (err) {
            alert(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        //console.log('Password is ' + cognitoUser.getPassword());
    });

    var authenticationData = {
      Username : $('#username').val(),
      Password : $('#password').val(),
    };
    var userData = {
      Username : $('#username').val(),
      Pool : userPool
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        localStorage.setItem('token', JSON.stringify(result.idToken.jwtToken));
        window.location = '/admin/';
      },
      onFailure: function(err) {
        console.log(err);
      }
    });
})

$('#loginin').submit(function(e){
  e.preventDefault();
  AWSCognito.config.region = '********';
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: '*********************************'
  });
  // Need to provide placeholder keys unless unauthorised user access is enabled for user pool
  AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'});

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({ 
    UserPoolId : '******************',
      ClientId : '**********************'
  });

  var authenticationData = {
    Username : $('#logusername').val(),
    Password : $('#logpassword').val(),
  };
  var userData = {
    Username : $('#logusername').val(),
    Pool : userPool
  };
  var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      localStorage.setItem('token', JSON.stringify(result.idToken.jwtToken));
      console.log(result);
      console.log();
      window.location = '/admin/';
    },
    onFailure: function(err) {
      console.log(err);
    }
  });
})
