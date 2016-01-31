require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
AV.Cloud.onVerified('email',function(request, response) {
  response.success("Hello world!");
});