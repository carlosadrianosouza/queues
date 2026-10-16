variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, hml, prd)"
  type        = string
}

variable "lambda_apps" {
  description = "Map of app_name => { function_type, memory_size, timeout, queue_arns }"
  type = map(object({
    function_type = string
    memory_size   = number
    timeout       = number
    queue_arns    = list(string)
  }))
}

variable "layer_arn" {
  description = "ARN of the shared Lambda layer"
  type        = string
}

variable "code_path" {
  description = "Path to the compiled Lambda code directory (e.g., ./dist)"
  type        = string
}

variable "token" {
  description = "Backend authentication token"
  type        = string
  sensitive   = true
}

variable "consumer_url_back" {
  description = "Backend API URL"
  type        = string
}

variable "consumer_url_play" {
  description = "Play API URL"
  type        = string
}

variable "consumer_url_messages" {
  description = "Messages API URL"
  type        = string
}

variable "consumer_url_gateway" {
  description = "Gateway API URL"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
