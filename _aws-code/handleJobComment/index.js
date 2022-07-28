const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const jwtToken = body.Authorization;

  const isAuthorized = await authorize(jwtToken);
  if (!isAuthorized) {
    return {
      statusCode: 401,
    };
  }

  const comment = body.Comment;

  try {
    //get job for current connection
    const params1 = {
      TableName: process.env.job_websocket_connections_table,
      IndexName: "ConnectionIdIndex",
      KeyConditionExpression: "ConnectionId = :hkey",
      ExpressionAttributeValues: {
        ":hkey": event.requestContext.connectionId,
      },
    };

    const jobIdQuery = await ddb.query(params1).promise();
    const jobId = jobIdQuery.Items[0].JobId;

    //save comment to db
    const commentDb = {
      JobId: jobId,
      RangeKeyHash: comment.RangeKeyHash,
      Text: comment.Text,
      Timestamp: comment.Timestamp,
      UserName: comment.UserName,
      UserSub: comment.UserSub,
    };
    await ddb
      .put({
        TableName: process.env.job_commments_table,
        Item: commentDb,
      })
      .promise();

    //get all connections for the job the incoming comment is targeted at
    const params2 = {
      TableName: process.env.job_websocket_connections_table,
      KeyConditionExpression: "JobId = :hkey",
      ExpressionAttributeValues: {
        ":hkey": jobId,
      },
    };

    const connectionsForJob = await ddb.query(params2).promise();

    const callbackAPI = new AWS.ApiGatewayManagementApi({
      endpoint:
        event.requestContext.domainName + "/" + event.requestContext.stage,
    });
    const response = { action: "commentJob", Comment: comment };

    //post comment to all connections
    const goneConnections = [];
    for (let item of connectionsForJob.Items) {
      try {
        await callbackAPI
          .postToConnection({
            ConnectionId: item.ConnectionId,
            Data: JSON.stringify(response),
          })
          .promise();
      } catch (e) {
        if (e.code == 410) {
          //gone exception
          goneConnections.push(item);
        }
      }
    }

    for (let item of goneConnections) {
      await ddb
        .delete({
          TableName: process.env.job_websocket_connections_table,
          Key: {
            JobId: item.JobId,
            ConnectionId: item.ConnectionId,
          },
        })
        .promise();
    }
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
  };
};

const {
  verifierFactory,
  errors: { JwtVerificationError, JwksNoMatchingKeyError },
} = require("@southlane/cognito-jwt-verifier");

async function authorize(jwtToken) {
  if (!jwtToken) {
    return false;
  }

  const verifier = verifierFactory({
    region: process.env.region,
    userPoolId: process.env.user_pool_id,
    appClientId: process.env.client_id,
    tokenType: "id",
  });

  try {
    await verifier.verify(jwtToken);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
