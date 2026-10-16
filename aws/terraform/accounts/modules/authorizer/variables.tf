variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
  sensitive   = true
}

variable "client_id" {
  description = "Azure AD Client ID"
  type        = string
  sensitive   = true
}

variable "layer_arn" {
  description = "ARN of the shared Lambda layer"
  type        = string
}

variable "code_path" {
  description = "Path to the compiled Lambda code directory"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 180
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
