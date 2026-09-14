const { docClient, PutCommand, UpdateCommand, DeleteCommand, TABLE_NAME, QueryCommand } = require("../shared/db");
const { getQueueItemKeys, STATUSES } = require("../shared/queue-engine");
const { broadcast } = require("../shared/websocket");

const getWsEndpoint = (event) => {
  if (!event.requestContext.domainName) return null;
  return `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
};

const sendResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(body)
});

exports.join = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const dateStr = new Date().toISOString().split("T")[0];
    
    // Construct entry
    const entry = {
      ...body,
      id: `Q${Date.now()}`,
      status: STATUSES.WAITING,
      joinedAt: new Date().toISOString(),
      checkedIn: body.checkedIn || false
    };

    const { PK, SK } = getQueueItemKeys(body.doctorId, dateStr, entry);

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK,
        SK,
        entryId: entry.id,
        hospitalDate: `${body.hospitalId}#${dateStr}`,
        ...entry
      }
    }));

    // Broadcast to WebSocket clients
    const endpoint = getWsEndpoint(event);
    if (endpoint) {
      await broadcast(endpoint, body.doctorId, {
        type: "JOIN_QUEUE",
        payload: entry
      });
    }

    return sendResponse(200, { success: true, entry });
  } catch (error) {
    console.error(error);
    return sendResponse(500, { error: "Failed to join queue" });
  }
};

exports.checkin = async (event) => {
  try {
    const { id } = event.pathParameters;
    // We need to fetch the item using GSI1 to get its PK and SK, 
    // then delete the old item and Put the new one (because SK changes when checkedIn changes)
    
    const res = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "entryId = :id",
      ExpressionAttributeValues: { ":id": id }
    }));

    if (!res.Items || res.Items.length === 0) {
      return sendResponse(404, { error: "Entry not found" });
    }

    const oldItem = res.Items[0];
    const newItem = { ...oldItem, checkedIn: true };
    const dateStr = oldItem.SK.split("#")[1];
    
    const { SK: newSK } = getQueueItemKeys(oldItem.doctorId, dateStr, newItem);

    // Transaction to replace the item
    const { TransactWriteCommand } = require("@aws-sdk/lib-dynamodb");
    await docClient.send(new TransactWriteCommand({
      TransactItems: [
        { Delete: { TableName: TABLE_NAME, Key: { PK: oldItem.PK, SK: oldItem.SK } } },
        { Put: { TableName: TABLE_NAME, Item: { ...newItem, SK: newSK } } }
      ]
    }));

    const endpoint = getWsEndpoint(event);
    if (endpoint) {
      await broadcast(endpoint, oldItem.doctorId, {
        type: "CHECK_IN",
        payload: { id }
      });
    }

    return sendResponse(200, { success: true, entry: newItem });
  } catch (error) {
    console.error(error);
    return sendResponse(500, { error: "Failed to check-in" });
  }
};
