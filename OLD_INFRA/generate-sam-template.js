require("dotenv").config();

const fs = require("fs");
const YAML = require("yaml");

const env = process.argv[2] || "dev";
const appName = process.argv[3] || null;
const configFileName = `app.${env}.config.yml`;

if (!fs.existsSync(configFileName)) {
  console.error(`Arquivo de configuração não encontrado: ${configFileName}`);
  process.exit(1);
}

const configFile = fs.readFileSync(configFileName, "utf8");
const config = YAML.parse(configFile);

const header = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Seller Greenn Queues - SAM Generated (${env.toUpperCase()})

Parameters:
  LayerBucket:
    Type: String

Globals:
  Function:
    Runtime: nodejs18.x
    Timeout: 30
    Environment:
      Variables:
        STAGE: ${env}
        APP_VERSION: "1.11.0"

Resources:
  MyCommonLayer:
    Type: AWS::Lambda::LayerVersion
    Properties:
      LayerName: my-common-layer
      Description: Common dependencies for Lambdas
      Content:
        S3Bucket: !Ref LayerBucket
        S3Key: layer.zip
      CompatibleRuntimes:
        - nodejs18.x

  QueueApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Sub "queue-api-${env}"
      Description: API Gateway for SQS integration

  ApiGatewayLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub "/aws/apigateway/${appName}-${env}"
      RetentionInDays: 30

  ApiGatewayLogsRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: apigateway.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs

  ApiGatewayAccount:
    Type: AWS::ApiGateway::Account
    Properties:
      CloudWatchRoleArn: !GetAtt ApiGatewayLogsRole.Arn

  ApiGatewaySqsRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: apigateway.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: SqsSendMessagePolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - sqs:SendMessage
                Resource: !Sub "arn:aws:sqs:*:*:sqs-*"

  QueueResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref QueueApi
      ParentId: !GetAtt QueueApi.RootResourceId
      PathPart: "{queueName}"

  QueueNameResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref QueueApi
      ParentId: !Ref QueueResource
      PathPart: "messages"

  QueueMethod:
    Type: AWS::ApiGateway::Method
    DependsOn:
      - ApiGatewayAuthorizer
      - LambdaAuthorizer
    Properties:
      RestApiId: !Ref QueueApi
      ResourceId: !Ref QueueNameResource
      HttpMethod: POST
      AuthorizationType: CUSTOM
      AuthorizerId: !Ref ApiGatewayAuthorizer
      RequestParameters:
        method.request.path.queueName: true
      Integration:
        Type: AWS
        IntegrationHttpMethod: POST
        Uri: !Sub "arn:aws:apigateway:\${AWS::Region}:sqs:path/\${AWS::AccountId}/{queueName}"
        Credentials: !GetAtt ApiGatewaySqsRole.Arn
        PassthroughBehavior: NEVER
        RequestParameters:
          integration.request.header.Content-Type: "'application/x-www-form-urlencoded'"
          integration.request.path.queueName: "method.request.path.queueName"
        RequestTemplates:
          application/json: |
            Action=SendMessage&MessageBody=$util.urlEncode($input.body)
        IntegrationResponses:
          - StatusCode: 200
            ResponseTemplates:
              application/json: |
                {
                  "success": true,
                  "message": "Message sent to queue successfully",
                  "queueName": "$input.params('queueName')"
                }
          - StatusCode: 400
            SelectionPattern: "4\\\\d{2}"
            ResponseTemplates:
              application/json: |
                {
                  "error": "Bad Request",
                  "message": "Invalid request format"
                }
          - StatusCode: 500
            SelectionPattern: "5\\\\d{2}"
            ResponseTemplates:
              application/json: |
                {
                  "error": "Internal Server Error",
                  "message": "Failed to send message to queue"
                }
      MethodResponses:
        - StatusCode: 200
        - StatusCode: 400
        - StatusCode: 500

  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - QueueMethod
      - ApiGatewayAuthorizer
      - AuthorizerInvokePermission
      - AuthorizerExecutionPermission
      - ApiGatewayAccount
    Properties:
      RestApiId: !Ref QueueApi
      StageName: ${env}
      Description: "API Gateway Deployment"
      StageDescription:
        AccessLogSetting:
          DestinationArn: !GetAtt ApiGatewayLogGroup.Arn
          Format: '$context.requestId $context.status $context.error.message $context.error.messageString'
        MethodSettings:
          - ResourcePath: '/*'
            HttpMethod: '*'
            LoggingLevel: INFO
            DataTraceEnabled: true
            MetricsEnabled: true

  ApiGatewayAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    DependsOn: LambdaAuthorizer
    Properties:
      Name: QueuesApiAuthorizer
      Type: TOKEN
      RestApiId: !Ref QueueApi
      AuthorizerUri: !Sub "arn:aws:apigateway:\${AWS::Region}:lambda:path/2015-03-31/functions/\${LambdaAuthorizer.Arn}/invocations"
      IdentitySource: "method.request.header.Authorization"
      AuthorizerResultTtlInSeconds: 0
`;

let resources = "";

const authorizer = `
  AuthorizerLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub "/aws/lambda/${appName}-authorizer"
      RetentionInDays: 180

  LambdaAuthorizer:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ${appName}-queues-api-authorizer
      Handler: src/authorizer/authorizer.handler
      CodeUri: dist/${appName}
      Layers:
        - !Ref MyCommonLayer
      Environment:
        Variables:
          TENANT_ID: ${process.env.TENANT_ID}
          CLIENT_ID: ${process.env.CLIENT_ID}
      Policies:
        - AWSLambdaBasicExecutionRole
        - Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
              Resource: !GetAtt AuthorizerLogGroup.Arn

  AuthorizerInvokePermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref LambdaAuthorizer
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub "arn:aws:execute-api:\${AWS::Region}:\${AWS::AccountId}:\${QueueApi}/*/*"

  AuthorizerExecutionPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref LambdaAuthorizer
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub "arn:aws:execute-api:\${AWS::Region}:\${AWS::AccountId}:\${QueueApi}/authorizers/*"
`;

resources += authorizer;

const appsToProcess = appName
  ? config.parameters[0].default.filter((app) => app.appName === appName)
  : config.parameters[0].default;

appsToProcess.forEach((app) => {
  app.queues.forEach((queue) => {
    const queueName = "sqs-" + queue;
    const resourceName = "sqs" + queue.replace(/[^a-zA-Z0-9]/g, "");
    const functionName = "fn-" + queue;
    const functionResourceName = "Fn" + queue.replace(/[^a-zA-Z0-9]/g, "");

    resources += `  ${resourceName}:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: ${queueName}

  ${functionResourceName}:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ${functionName}
      Handler: src/handlers/handler-message-consumer.handler
      CodeUri: dist/${appName}
      Layers:
        - !Ref MyCommonLayer
      Events:
        SQSTrigger:
          Type: SQS
          Properties:
            Queue: !GetAtt ${resourceName}.Arn
            BatchSize: 1
      Environment:
        Variables:
          QUEUE_NAME: ${queueName}
          TOKEN: ${process.env.TOKEN}
          CONSUMER_URL_BACK: ${process.env.CONSUMER_URL_BACK}
          CONSUMER_URL_PLAY: ${process.env.CONSUMER_URL_PLAY}
          CONSUMER_URL_MESSAGES: ${process.env.CONSUMER_URL_MESSAGES}
          CONSUMER_URL_GATEWAY: ${process.env.CONSUMER_URL_GATEWAY}
      Policies:
        - Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Action:
                - sqs:SendMessage
                - sqs:ReceiveMessage
                - sqs:DeleteMessage
                - sqs:GetQueueAttributes
              Resource: !GetAtt ${resourceName}.Arn
`;
  });
});

const outputs = `
Outputs:
  QueueApiUrl:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://\${QueueApi}.execute-api.\${AWS::Region}.amazonaws.com/${env}"
`;

const template = header + resources + outputs;

fs.writeFileSync("template.yaml", template);

const appInfo = appName ? ` para função: ${appName}` : "";
console.log(
  `template.yaml gerado com sucesso para o ambiente: ${env}${appInfo}`
);
