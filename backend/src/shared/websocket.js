const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");
const { docClient, QueryCommand, TABLE_NAME } = require("./db");

let apiClient;

function getApiClient(endpoint) {
  if (!apiClient) {
    apiClient = new ApiGatewayManagementApiClient({ endpoint: endpoint.replace("wss://", "https://") });
  }
  return apiClient;
}

/**
 * Broadcast an event to all subscribers of a specific topic (doctorId or hospitalId)
 */
async function broadcast(endpoint, topicId, eventPayload) {
  // Topics could be managed as GSI on CONN# items.
  // For simplicity, let's say CONN# items have SK = META, and attribute `topics` = [doctorId, hospitalId]
  // We can query connections.
  // To keep it simple for now, we'll scan connections or assume connections are stored by Topic
  // Actually, a better single-table pattern for PubSub:
  // PK = TOPIC#<doctorId>, SK = CONN#<connectionId>
  
  const res = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `TOPIC#${topicId}`,
      ":sk": "CONN#"
    }
  }));

  if (!res.Items || res.Items.length === 0) return;

  const client = getApiClient(endpoint);
  
  const promises = res.Items.map(async (item) => {
    const connectionId = item.SK.split("#")[1];
    try {
      await client.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(eventPayload))
      }));
    } catch (e) {
      if (e.$metadata?.httpStatusCode === 410) {
        // Stale connection
        // Clean up connection
      }
    }
  });

  await Promise.allSettled(promises);
}

module.exports = {
  broadcast
};
