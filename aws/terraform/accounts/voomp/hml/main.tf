# --- Secrets Manager ---

data "aws_secretsmanager_secret" "credentials" {
  name = var.secret_name
}

data "aws_secretsmanager_secret_version" "credentials" {
  secret_id = data.aws_secretsmanager_secret.credentials.id
}

locals {
  credentials = jsondecode(data.aws_secretsmanager_secret_version.credentials.secret_string)

  # Build lambda_apps map after SQS module resolves queue ARNs
  lambda_apps = {
    for app in local.fn_apps : app.appName => {
      function_type = app.functionType
      memory_size   = app.memorySize
      timeout       = app.timeout
      queue_arns    = [for q in app.queues : module.sqs.queue_arns[q]]
    }
  }
}

# --- Lambda Layer ---

data "archive_file" "lambda_layer" {
  type        = "zip"
  source_dir  = "./layer"
  output_path = "${path.module}/.terraform/tmp/layer.zip"
}

resource "aws_lambda_layer_version" "common" {
  layer_name          = "${var.project}-${var.environment}-common-layer"
  filename            = data.archive_file.lambda_layer.output_path
  source_code_hash    = data.archive_file.lambda_layer.output_base64sha256
  compatible_runtimes = ["nodejs18.x"]
}

# --- SQS Queues ---

module "sqs" {
  source = "../../modules/sqs"

  environment     = var.environment
  queues_map      = local.sqs_queues_map
  queue_overrides = local.queue_overrides
  tags            = local.common_tags
}

# --- Authorizer ---

module "authorizer" {
  source = "../../modules/authorizer"

  project     = var.project
  environment = var.environment
  tenant_id   = local.credentials.TENANT_ID
  client_id   = local.credentials.CLIENT_ID
  layer_arn   = aws_lambda_layer_version.common.arn
  code_path   = "./dist"
  tags        = local.common_tags
}

# --- Lambda Consumers (1 per tier, N queues per Lambda) ---

module "lambda" {
  source = "../../modules/lambda"

  project               = var.project
  environment           = var.environment
  lambda_apps           = local.lambda_apps
  layer_arn             = aws_lambda_layer_version.common.arn
  code_path             = "./dist"
  token                 = local.credentials.TOKEN
  consumer_url_back     = local.credentials.CONSUMER_URL_BACK
  consumer_url_play     = local.credentials.CONSUMER_URL_PLAY
  consumer_url_messages = local.credentials.CONSUMER_URL_MESSAGES
  consumer_url_gateway  = local.credentials.CONSUMER_URL_GATEWAY
  tags                  = local.common_tags
}

# --- API Gateway ---

module "api_gateway" {
  source = "../../modules/api-gateway"

  project                 = var.project
  environment             = var.environment
  region                  = var.region
  account_id              = var.account_id
  authorizer_function_arn = module.authorizer.function_arn
  authorizer_invoke_arn   = module.authorizer.invoke_arn
  tags                    = local.common_tags
}
