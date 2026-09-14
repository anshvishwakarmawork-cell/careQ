# CareQueue Serverless Backend

This is the AWS Serverless Backend for CareQueue, built with AWS SAM and Node.js.

## Architecture

- **API Gateway**: Exposes HTTP APIs and WebSockets.
- **Lambda**: Serverless compute running Node.js 20.x handlers.
- **DynamoDB**: Single-table design (`CareQueue` table).
- **Cognito**: User authentication.

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- Node.js 20+

## Local Development

You can run the API locally using SAM local:

```bash
cd backend
sam build
sam local start-api
```

### Unit Tests

Run the unit tests inside the `src/` directory:

```bash
cd backend/src
npm install
npm test
```

## Deployment

To deploy this application to your AWS account, run:

```bash
cd backend
sam build
sam deploy --guided
```

Answer the prompts to deploy the stack. The output will provide your HTTP API and WebSocket API URLs, as well as Cognito details.

## IAM Notes
- The Lambda functions are assigned a `DynamoDBCrudPolicy` scoped to the `CareQueue` table.
- If configuring SNS for SMS, an additional `SNSPublishMessagePolicy` will be needed.
