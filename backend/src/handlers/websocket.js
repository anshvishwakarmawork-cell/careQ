const { docClient, PutCommand, DeleteCommand, TABLE_NAME } = require("../shared/db");

const sendResponse = (statusCode, body) => ({
  statusCode,
  body: typeof body === "string" ? body : JSON.stringify(body)
});

exports.connect = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    // We might extract userId/role from the authorizer context here
    // For now, we just allow the connection
    return sendResponse(200, "Connected");
  } catch (err) {
    return sendResponse(500, "Failed to connect: " + err.message);
  }
};

exports.disconnect = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    
    // In a real app, we might need a GSI to find all TOPIC# items for this CONN# and delete them.
    // Assuming we don't have GSI on SK for now, the cleanup might be complex or done via TTL.
    
    return sendResponse(200, "Disconnected");
  } catch (err) {
    return sendResponse(500, "Failed to disconnect: " + err.message);
  }
};

exports.default = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body || "{}");

    if (body.action === "subscribe" && body.topicId) {
      // Store the subscription: PK = TOPIC#<topicId>, SK = CONN#<connectionId>
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TOPIC#${body.topicId}`,
          SK: `CONN#${connectionId}`,
          timestamp: Date.now()
        }
      }));
      return sendResponse(200, { message: "Subscribed successfully" });
    }

    return sendResponse(200, "Action not supported");
  } catch (err) {
    return sendResponse(500, "Error: " + err.message);
  }
};
