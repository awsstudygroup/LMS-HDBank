/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */ /*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require("aws-sdk");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const express = require("express");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "courses";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = true; // TODO: update in case is required to use that definition
const partitionKeyName = "ID";
const partitionKeyType = "S";
const userIndex = "CreatorID-index";
const publicityIndex = "Publicity-index";
const creatorIDIndex = "CreatorID-index";
const viewsIndex = "Views-index";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/courses";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";
const aCPath = "/:ac";

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

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path, function (req, res) {
  const condition = {};
  condition[sortKeyName] = {
    ComparisonOperator: "EQ",
  };
  condition[sortKeyName]["AttributeValueList"] = [
    req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH,
  ];
  // condition[partitionKeyName] = {
  //   ComparisonOperator: 'EQ'
  // }

  // if (userIdPresent && req.apiGateway) {
  //   condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // } else {
  //   try {
  //     condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition,
    IndexName: "CreatorID-index",
  };
  console.log(queryParams);

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      res.json(data.Items);
    }
  });
});

//PUBLIC
app.get(path + "/public", function (req, res) {
  const condition = {};
  condition[sortKeyName] = {
    ComparisonOperator: "EQ",
  };
  // condition[sortKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // condition[partitionKeyName] = {
  //   ComparisonOperator: 'EQ'
  // }

  // if (userIdPresent && req.apiGateway) {
  //   condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // } else {
  //   try {
  //     condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }

  let queryParams = {
    TableName: tableName,
    IndexName: publicityIndex,
    KeyConditionExpression: "Publicity = :value",
    ExpressionAttributeValues: {
      ":value": 1,
    },
  };
  console.log(queryParams);

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      res.json(data.Items);
    }
  });
});

app.get(path + "/private", function (req, res) {
  const condition = {};
  condition[sortKeyName] = {
    ComparisonOperator: "EQ",
  };
  // condition[sortKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // condition[partitionKeyName] = {
  //   ComparisonOperator: 'EQ'
  // }

  // if (userIdPresent && req.apiGateway) {
  //   condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // } else {
  //   try {
  //     condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }

  let queryParams = {
    TableName: tableName,
    IndexName: publicityIndex,
    KeyConditionExpression: "Publicity = :value",
    ExpressionAttributeValues: {
      ":value": 0,
    },
  };
  console.log(queryParams);

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      res.json(data.Items);
    }
  });
});

// /*********************************************
//  * HTTP Get method for get object by user id*
//  *********************************************/

app.get(path + "/myCourses", function (req, res) {
  let value = "";
  try {
    value =
      req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
        ":CognitoSignIn:"
      )[1];
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: "Wrong column type " + err });
  }

  let queryItemParams = {
    TableName: tableName,
    IndexName: creatorIDIndex,
    KeyConditionExpression: "CreatorID = :value",
    ExpressionAttributeValues: {
      ":value": value,
    },
  };

  dynamodb.query(queryItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      res.json(data.Items);
    }
  });
});

// /*********************************************
//  * HTTP Get method for get object by user id*
//  *********************************************/

app.get(path + "/topViews", function (req, res) {
  let value = "";

  let scanParams = {
    TableName: tableName,
    IndexName: viewsIndex,
    Limit: "10",
  };

  dynamodb.scan(scanParams, (err, data) => {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      res.json(data.Items);
    }
  });
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

  dynamodb.get(getItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      if (data.Item) {
        res.json(data.Item);
      } else {
        res.json(data);
      }
    }
  });
});

// /************************************
// * HTTP put method for insert object *
// *************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: req.body, url: req.url, data: data });
    }
  });
});

// /************************************
// * HTTP post method for insert object *
// *************************************/

app.post(path, function (req, res) {
  req.body["CreatorID"] =
    req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider.split(
      ":CognitoSignIn:"
    )[1] || UNAUTH;

  // check if item exist or not
  if (req.body["OldID"]) {
    let deleteParams = {
      TableName: tableName,
      Key: { ID: req.body["OldID"] },
    };
    dynamodb.delete(deleteParams, function (err, data) {
      if (err) console.log(err);
      else console.log(data);
    });
  }
  // req.body = { ...req.body, OldID: _ }
  delete req.body["OldID"];
  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  console.log(req.body);
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: "post call succeed!", url: req.url, data: data });
    }
  });
});

app.put(path + "/addAC" + aCPath, function (req, res) {
  const params = {};
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

  let upadteItemParams = {
    TableName: tableName,
    Key: params,
    UpdateExpression: "ADD #acC :vals",
    ExpressionAttributeNames: { "#acC": "AccessCode" },
    ExpressionAttributeValues: {
      ":vals": dynamodb.createSet([req.query["ac"]]),
    },
    ReturnValues: "UPDATED_NEW",
  };
  
  dynamodb.update(upadteItemParams, (err, data) => {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.json({ error: "Could not update item: " + err.message });
    } else {
      res.json(data);
    }
  });
});

// /**************************************
// * HTTP remove method to delete object *
// ***************************************/

app.delete(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  const params = {};
  // if (userIdPresent && req.apiGateway) {
  // params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  // } else {
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
  // }
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

  let removeItemParams = {
    TableName: tableName,
    Key: params,
  };
  dynamodb.delete(removeItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    } else {
      res.json({ url: req.url, data: data });
    }
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
