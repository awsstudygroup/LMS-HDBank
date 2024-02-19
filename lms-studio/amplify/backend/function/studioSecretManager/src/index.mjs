import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = process.env.SECRET_NAME;

const client = new SecretsManagerClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };
  let response;
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers,
    };
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    console.log("Error:", error);
    return {
      statusCode: 500,
      body: "An error occurred while retrieving the credentials.",
      headers,
    };
  }
};
