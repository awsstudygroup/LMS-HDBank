import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import express from "express";
import bodyParser from "body-parser";
import awsServerlessExpressMiddleware from "aws-serverless-express/middleware.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let tableName = "courses";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "ID";
const partitionKeyType = "S";
const publicityIndex = "Publicity-index"
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/courses";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path, function(req, res) {

  let scanInput = {
    TableName: tableName,
  }

  let command = new ScanCommand(scanInput);
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

app.get(path + "/public", function (req, res) {
  let queryParams = {
    TableName: tableName,
    IndexName: publicityIndex,
    KeyConditionExpression: "Publicity = :value",
    ExpressionAttributeValues: {
      ":value": 1,
    },
  };

  const command = new QueryCommand(queryParams);
  docClient.send(command).then(
    (data) => {
      res.json(data.Items);
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

// /*****************************************
//  * HTTP Get method for get single object *
//  *****************************************/

app.get(path + hashKeyPath, function (req, res) {
  const params = {};

  try {
    params[partitionKeyName] = convertUrlType(
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

  const command = new GetCommand(getItemParams);
  docClient.send(command).then(
    (data) => {
      if (data.Item) {
        res.json(data.Item);
      } else {
        res.json(data);
      }
    },
    (err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    }
  );
});

app.put(path + hashKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(
        req.params[partitionKeyName],
        partitionKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let upadteItemParams = {
    TableName: tableName,
    Key: params,
    UpdateExpression: "set #views = #views + :unit",
    ExpressionAttributeNames: { "#views": "Views" },
    ExpressionAttributeValues: {
      ":unit": 1,
    },
  };

  const command = new UpdateCommand(upadteItemParams);
  docClient.send(command).then(
    (data) => {
      res.json({ success: req.body, url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: err, info: req.info, body: req.body });
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