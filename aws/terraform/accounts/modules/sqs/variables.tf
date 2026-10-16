variable "queues_map" {
  description = "Map of queue_name => { function_type, app_name }"
  type = map(object({
    function_type = string
    app_name      = string
  }))
}

variable "environment" {
  description = "Environment name (used as prefix in resource names)"
  type        = string
}

variable "queue_overrides" {
  description = "Per-queue configuration overrides (merged with defaults)"
  type        = map(map(any))
  default     = {}
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
