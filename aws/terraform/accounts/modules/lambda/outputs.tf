output "function_arns" {
  description = "Map of app_name => Lambda Function ARN"
  value       = { for k, v in aws_lambda_function.consumer : k => v.arn }
}

output "function_names" {
  description = "Map of app_name => Lambda Function Name"
  value       = { for k, v in aws_lambda_function.consumer : k => v.function_name }
}
