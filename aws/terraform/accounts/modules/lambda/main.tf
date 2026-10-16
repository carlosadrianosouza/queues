data "archive_file" "lambda_code" {
  type        = "zip"
  source_dir  = var.code_path
  output_path = "${path.module}/.terraform/tmp/lambda_code.zip"
}

# --- IAM Role (shared by all Lambda consumers) ---

resource "aws_iam_role" "lambda" {
  name = "${var.project}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "lambda_sqs" {
  name = "sqs-access"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ]
      Resource = flatten([for app in var.lambda_apps : app.queue_arns])
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# --- CloudWatch Log Groups (1 per app) ---

resource "aws_cloudwatch_log_group" "consumer" {
  for_each = var.lambda_apps

  name              = "/aws/lambda/${each.key}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# --- Lambda Functions (1 per app/tier) ---

resource "aws_lambda_function" "consumer" {
  for_each = var.lambda_apps

  function_name = each.key
  role          = aws_iam_role.lambda.arn
  handler       = "src/handlers/handler-message-consumer.handler"
  runtime       = "nodejs18.x"
  timeout       = each.value.timeout
  memory_size   = each.value.memory_size

  filename         = data.archive_file.lambda_code.output_path
  source_code_hash = data.archive_file.lambda_code.output_base64sha256

  layers = [var.layer_arn]

  environment {
    variables = {
      STAGE                 = var.environment
      TOKEN                 = var.token
      CONSUMER_URL_BACK     = var.consumer_url_back
      CONSUMER_URL_PLAY     = var.consumer_url_play
      CONSUMER_URL_MESSAGES = var.consumer_url_messages
      CONSUMER_URL_GATEWAY  = var.consumer_url_gateway
    }
  }

  depends_on = [aws_cloudwatch_log_group.consumer]

  tags = merge(var.tags, {
    Name         = each.key
    FunctionType = each.value.function_type
  })
}

# --- SQS Event Source Mappings (N queues → 1 Lambda per app) ---

locals {
  # Flatten: for each app, create a mapping entry per queue ARN
  sqs_triggers = flatten([
    for app_name, app in var.lambda_apps : [
      for idx, queue_arn in app.queue_arns : {
        key       = "${app_name}--${idx}"
        app_name  = app_name
        queue_arn = queue_arn
      }
    ]
  ])

  sqs_triggers_map = { for t in local.sqs_triggers : t.key => t }
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  for_each = local.sqs_triggers_map

  event_source_arn = each.value.queue_arn
  function_name    = aws_lambda_function.consumer[each.value.app_name].arn
  batch_size       = 1
  enabled          = true
}
