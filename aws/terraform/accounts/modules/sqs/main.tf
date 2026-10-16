locals {
  defaults = {
    message_retention_seconds     = 345600 # 4 dias
    visibility_timeout_seconds    = 60
    delay_seconds                 = 0
    max_message_size              = 262144
    receive_wait_time_seconds     = 0
    dlq_max_receive_count         = 3
    dlq_message_retention_seconds = 1209600 # 14 dias
  }

  queues_with_config = {
    for name, q in var.queues_map : name => merge(local.defaults, lookup(var.queue_overrides, name, {}), {
      queue_name    = name
      function_type = q.function_type
      app_name      = q.app_name
    })
  }
}

resource "aws_sqs_queue" "dlq" {
  for_each = local.queues_with_config

  #name                      = "sbq-${each.key}-dlq"
  name                      = "sbq-${var.environment}-${each.key}-dlq"
  message_retention_seconds = each.value.dlq_message_retention_seconds

  tags = merge(var.tags, {
    Name         = "sbq-${each.key}-dlq"
    QueueName    = each.key
    FunctionType = each.value.function_type
  })
}

resource "aws_sqs_queue" "main" {
  for_each = local.queues_with_config

  #name                       = "sbq-${each.key}"
  name                       = "sbq-${var.environment}-${each.key}"
  message_retention_seconds  = each.value.message_retention_seconds
  visibility_timeout_seconds = each.value.visibility_timeout_seconds
  delay_seconds              = each.value.delay_seconds
  max_message_size           = each.value.max_message_size
  receive_wait_time_seconds  = each.value.receive_wait_time_seconds

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[each.key].arn
    maxReceiveCount     = each.value.dlq_max_receive_count
  })

  tags = merge(var.tags, {
    Name         = "sbq-${each.key}"
    QueueName    = each.key
    FunctionType = each.value.function_type
  })
}
