data "archive_file" "authorizer_code" {
  type        = "zip"
  source_dir  = var.code_path
  output_path = "${path.module}/.terraform/tmp/authorizer_code.zip"
}

resource "aws_cloudwatch_log_group" "authorizer" {
  name              = "/aws/lambda/fn-${var.project}-${var.environment}-authorizer"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_iam_role" "authorizer" {
  name = "${var.project}-${var.environment}-authorizer-role"

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

resource "aws_iam_role_policy_attachment" "authorizer_basic" {
  role       = aws_iam_role.authorizer.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "authorizer" {
  function_name = "fn-${var.project}-${var.environment}-authorizer"
  role          = aws_iam_role.authorizer.arn
  handler       = "src/authorizer/authorizer.handler"
  runtime       = "nodejs18.x"
  timeout       = 10
  memory_size   = 128

  filename         = data.archive_file.authorizer_code.output_path
  source_code_hash = data.archive_file.authorizer_code.output_base64sha256

  layers = [var.layer_arn]

  environment {
    variables = {
      TENANT_ID = var.tenant_id
      CLIENT_ID = var.client_id
    }
  }

  depends_on = [aws_cloudwatch_log_group.authorizer]

  tags = var.tags
}
