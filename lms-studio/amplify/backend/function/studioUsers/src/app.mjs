/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

// AWS.config.update({ region: process.env.TABLE_REGION });

const client = new CognitoIdentityProviderClient({});

const userPoolId = "userPoolId";
const username = "username";
const path = "/users";
const byUserNamePath = "/byUserName";
const userIdPath = "/:" + username;

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.get(path + byUserNamePath, function (req, res) {
  if (!req.query[userPoolId] || !req.query[username]) {
    res.statusCode = 500;
    // res.json({ error: " " + err });
  }

  const input = {
    UserPoolId: req.query[userPoolId], // required
    Username: req.query[username], // required
  };
  const command = new AdminGetUserCommand(input);
  client.send(command)
    .then((data) => {
      res.json(data);
    },
    (error) => {
      console.log(error);
      res.statusCode = 500;
      res.json({ error: " " + error });
    }
    )
});

app.put(path, function (req, res) {});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export default app;
