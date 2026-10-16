variable "project" {
  description = "Project name"
  type        = string
  default     = "voomp-queues"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "secret_name" {
  description = "Name of the AWS Secrets Manager secret containing credentials"
  type        = string
}
