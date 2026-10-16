variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "authorizer_function_arn" {
  description = "ARN of the authorizer Lambda function"
  type        = string
}

variable "authorizer_invoke_arn" {
  description = "Invoke ARN of the authorizer Lambda"
  type        = string
}

variable "queue_groups" {
  description = "List of queue group path parts (back, play, messages, gateway)"
  type        = list(string)
  default     = ["back", "play", "messages", "gateway"]
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
