output "api_id" {
  description = "REST API ID"
  value       = aws_api_gateway_rest_api.this.id
}

output "api_url" {
  description = "API Gateway invoke URL"
  value       = aws_api_gateway_stage.this.invoke_url
}

output "execution_arn" {
  description = "API Gateway execution ARN"
  value       = aws_api_gateway_rest_api.this.execution_arn
}
