output "queue_arns" {
  description = "Map of queue_name => ARN"
  value       = { for k, v in aws_sqs_queue.main : k => v.arn }
}

output "queue_urls" {
  description = "Map of queue_name => URL"
  value       = { for k, v in aws_sqs_queue.main : k => v.url }
}

output "dlq_arns" {
  description = "Map of queue_name => DLQ ARN"
  value       = { for k, v in aws_sqs_queue.dlq : k => v.arn }
}
