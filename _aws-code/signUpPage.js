const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const jobId = JSON.parse(event.body).Page;
  const connectionId = event.requestContext.connectionId;
  try {
    await ddb
      .put({
        TableName: process.env.job_websocket_connections_table,
        Item: {
          JobId: jobId,
          ConnectionId: connectionId,
        },
      })
      .promise();
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
    };
  }
  const callbackAPI = new AWS.ApiGatewayManagementApi({
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });
  const response = { action: "signUpPage" };

  try {
    //get comments for current job
    const params1 = {
      TableName: process.env.job_commments_table,
      KeyConditionExpression: "JobId = :hkey",
      ExpressionAttributeValues: {
        ":hkey": jobId,
      },
    };

    const commentsQuery = await ddb.query(params1).promise();
    const commentsForJob = commentsQuery.Items.map((c) => {
      return {
        Text: c.Text,
        Timestamp: c.Timestamp,
        UserName: c.UserName,
        UserSub: c.UserSub,
      };
    });
    response.Comments = commentsForJob;
    console.log(response);
    await callbackAPI
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(response),
      })
      .promise();
  } catch (e) {
    console.log(e);
    await ddb
      .delete({
        TableName: process.env.job_websocket_connections_table,
        Key: {
          ConnectionId: connectionId,
        },
      })
      .promise();
    console.log(e);
    return {
      statusCode: 500,
    };
  }
  return {
    statusCode: 200,
  };
};
