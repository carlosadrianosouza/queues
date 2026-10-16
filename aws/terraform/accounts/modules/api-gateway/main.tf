resource "aws_api_gateway_rest_api" "this" {
  name        = "${var.project}-${var.environment}-api"
  description = "Queue API Gateway - ${var.environment}"

  tags = var.tags
}

# --- IAM Role for API GW → SQS ---

resource "aws_iam_role" "apigw_sqs" {
  name = "${var.project}-${var.environment}-apigw-sqs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "apigateway.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "apigw_sqs" {
  name = "sqs-send-message"
  role = aws_iam_role.apigw_sqs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sqs:SendMessage"]
      Resource = "arn:aws:sqs:*:*:sbq-*"
    }]
  })
}

# --- Authorizer ---

resource "aws_api_gateway_authorizer" "jwt" {
  name                             = "${var.project}-authorizer"
  rest_api_id                      = aws_api_gateway_rest_api.this.id
  type                             = "TOKEN"
  authorizer_uri                   = var.authorizer_invoke_arn
  identity_source                  = "method.request.header.Authorization"
  authorizer_result_ttl_in_seconds = 0
}

resource "aws_lambda_permission" "apigw_authorizer" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.authorizer_function_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*"
}

# --- Resources: /{queueName}/{group} ---

resource "aws_api_gateway_resource" "queue_name" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "{queueName}"
}

resource "aws_api_gateway_resource" "group" {
  for_each = toset(var.queue_groups)

  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.queue_name.id
  path_part   = each.key
}

# --- Method + Integration per group ---

resource "aws_api_gateway_method" "post" {
  for_each = toset(var.queue_groups)

  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.group[each.key].id
  http_method   = "POST"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.jwt.id

  request_parameters = {
    "method.request.path.queueName" = true
  }
}

resource "aws_api_gateway_integration" "sqs" {
  for_each = toset(var.queue_groups)

  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.group[each.key].id
  http_method             = aws_api_gateway_method.post[each.key].http_method
  type                    = "AWS"
  integration_http_method = "POST"
  uri                     = "arn:aws:apigateway:${var.region}:sqs:path/${var.account_id}/{queueName}"
  credentials             = aws_iam_role.apigw_sqs.arn
  passthrough_behavior    = "NEVER"

  request_parameters = {
    "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
    "integration.request.path.queueName"      = "method.request.path.queueName"
  }

  request_templates = {
    "application/json" = "Action=SendMessage&MessageBody=$util.urlEncode($input.body)"
  }
}

resource "aws_api_gateway_method_response" "ok" {
  for_each = toset(var.queue_groups)

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.group[each.key].id
  http_method = aws_api_gateway_method.post[each.key].http_method
  status_code = "200"
}

resource "aws_api_gateway_method_response" "error" {
  for_each = toset(var.queue_groups)

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.group[each.key].id
  http_method = aws_api_gateway_method.post[each.key].http_method
  status_code = "500"
}

resource "aws_api_gateway_integration_response" "ok" {
  for_each = toset(var.queue_groups)

  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.group[each.key].id
  http_method = aws_api_gateway_method.post[each.key].http_method
  status_code = "200"

  response_templates = {
    "application/json" = <<-EOF
      {
        "success": true,
        "message": "Message sent to queue successfully",
        "queueName": "$input.params('queueName')"
      }
    EOF
  }

  depends_on = [aws_api_gateway_integration.sqs]
}

resource "aws_api_gateway_integration_response" "error" {
  for_each = toset(var.queue_groups)

  rest_api_id       = aws_api_gateway_rest_api.this.id
  resource_id       = aws_api_gateway_resource.group[each.key].id
  http_method       = aws_api_gateway_method.post[each.key].http_method
  status_code       = "500"
  selection_pattern = "5\\d{2}"

  response_templates = {
    "application/json" = <<-EOF
      {
        "error": "Internal Server Error",
        "message": "Failed to send message to queue"
      }
    EOF
  }

  depends_on = [aws_api_gateway_integration.sqs]
}

# --- Deployment + Stage ---

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.queue_name.id,
      [for g in var.queue_groups : aws_api_gateway_resource.group[g].id],
      [for g in var.queue_groups : aws_api_gateway_method.post[g].id],
      [for g in var.queue_groups : aws_api_gateway_integration.sqs[g].id],
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration_response.ok,
    aws_api_gateway_integration_response.error,
  ]
}

# --- CloudWatch Logs Role (account-level setting for API Gateway) ---

resource "aws_iam_role" "apigw_cloudwatch" {
  name = "${var.project}-${var.environment}-apigw-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "apigateway.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "apigw_cloudwatch" {
  role       = aws_iam_role.apigw_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_api_gateway_account" "this" {
  cloudwatch_role_arn = aws_iam_role.apigw_cloudwatch.arn

  depends_on = [aws_iam_role_policy_attachment.apigw_cloudwatch]
}

# --- CloudWatch Log Group ---

resource "aws_cloudwatch_log_group" "apigw" {
  name              = "/aws/apigateway/${var.project}-${var.environment}"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = var.environment

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigw.arn
    format          = "$context.requestId $context.status $context.error.message $context.error.messageString"
  }

  tags = var.tags

  depends_on = [aws_api_gateway_account.this]
}
