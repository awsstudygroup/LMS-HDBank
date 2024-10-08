/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

// AWS.config.update({ region: process.env.TABLE_REGION });

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "UIConfig";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "ID";
const partitionKeyType = "S";
const path = "/faqs";
const hashKeyPath = "/:" + partitionKeyName;
const UNAUTH = "UNAUTH";

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

// convert infor string param to expected Type
const convertInfoType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

app.get(path, function (req, res) {

  let scanItemParams = {
    TableName: tableName,
  };
  let command = new ScanCommand(scanItemParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Item);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

app.get(path + hashKeyPath, function (req, res) {
  console.log(req);
  const params = {};
  try {
    params[partitionKeyName] = convertInfoType(
      req.params[partitionKeyName],
      partitionKeyType
    );
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: "Wrong column type " + err });
  }

  let getItemParams = {
    TableName: tableName,
    Key: params,
  };
  console.log(getItemParams);
  let command = new GetCommand(getItemParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Item);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
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
