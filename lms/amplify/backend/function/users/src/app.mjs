/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUserPoolsCommand,
  RevokeTokenCommand
} from "@aws-sdk/client-cognito-identity-provider";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

const client = new CognitoIdentityProviderClient({ });
const clientId = "lmsbc7a393d_app_client";
const path = "/users";
const token = "Token";
const tokenKey = "/:" + token;

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
// const found = false;
// const nextToken = ""
// const input = { // ListUserPoolsRequest
//   NextToken: nextToken,
//   MaxResults: 1, // required
// };
// while (found || nextToken){
//   const response = await client.send(command);

// }

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});


app.get(path + tokenKey, function (req, res) {
  console.log("req", req)
  const input = {
    // RevokeTokenRequest
    Token: req.params[token], // required
    ClientId: clientId, // required
  };
  console.log("input", input)
  const command = new RevokeTokenCommand(input);
  client.send(command).then(
    (data) => {
      console.log(data);
      res.json({success: 'get call succeed!', url: req.url});
    },
    (error) => {
      console.log(error);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + error });
    }
  );
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app;
