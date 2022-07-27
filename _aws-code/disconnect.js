const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const params = {
      TableName: process.env.job_websocket_connections_table,
      IndexName: "ConnectionIdIndex",
      KeyConditionExpression: "ConnectionId = :hkey",
      ExpressionAttributeValues: {
        ":hkey": event.requestContext.connectionId,
      },
    };

    const queryResult = await ddb.query(params).promise();
    for (let item of queryResult.Items) {
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
