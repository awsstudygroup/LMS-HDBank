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

let tableName = "UserCourse";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = true; // TODO: update in case is required to use that definition
const partitionKeyName = "UserID";
const partitionKeyType = "S";
const sortKeyName = "CourseID";
const sortKeyType = "S";
const hasSortKey = sortKeyName !== "";
const path = "/users/courses";
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
  const condition = {}
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1] || UNAUTH ];
  } else {
    try {
      condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  // condition["Assign"] = {
  //   ComparisonOperator: 'EQ',
  //   AttributeValueList: ["ASSIGNED"]
  // }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition,
    FilterExpression: 'Assign = :status',
    ExpressionAttributeValues : {':status' : "ASSIGNED"}
  }

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

app.get(path + "/myLearning", function (req, res) {
  const condition = {};
  condition[partitionKeyName] = {
    ComparisonOperator: "EQ",
  };

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]["AttributeValueList"] = [req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(":CognitoSignIn:")[1] || UNAUTH];
  } else {
    try {
      condition[partitionKeyName]["AttributeValueList"] = [
        convertUrlType(req.params[partitionKeyName], partitionKeyType),
      ];
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition,
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

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + sortKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(":CognitoSignIn:")[1] || UNAUTH;
    // console.log(req);
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
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
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

/************************************
* HTTP put method for insert object *
*************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["UserID"] = req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(":CognitoSignIn:")[1] || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  const command = new PutCommand(putItemParams);
  docClient.send(command).then(
    (data) => {
      res.json({ success: "put call succeed!", url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: err, info: req.info, body: req.body });
    }
  );
});

/************************************
* HTTP put method for update object *
*************************************/

app.put(path + "/update" + sortKeyPath, function (req, res) {
  const params = {};
  if (userIdPresent) {
    params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(":CognitoSignIn:")[1] || UNAUTH;
  }

  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let upadteItemParams = {
    TableName: tableName,
    Key: params,
    // UpdateExpression: 'set #lastUpdated = :value ',
    // ExpressionAttributeNames: {'#views' : 'LastAccessed'},
    // ExpressionAttributeValues:{
    //   ":value": req.body['LastAccessed'],
    // }
    AttributeUpdates: {
      LastAccessed: {
        Action: "PUT",
        Value: req.body["LastAccessed"],
      },
      Status: {
        Action: "PUT",
        Value: "IN_PROGRESS",
      },
    },
  };
  const command = new UpdateCommand(upadteItemParams);
  docClient.send(command).then(
    (data) => {
      res.json({ success: req.body, url: req.url, data: data });
    },
    (err) => {
      res.statusCode = 500;
      res.json({ error: "Could not update item: " + err.message });
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