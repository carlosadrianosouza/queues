/*
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  fn_apps = [
    {
      functionType = "Low0"
      appName      = "fn-voomp-dev3-low-us-0"
      memorySize   = 128
      timeout      = 30
      queues = [
        "dev3-back-affiliates",
        "dev3-back-analysis",
        "dev3-back-call-evaluation",
        "dev3-back-capi",
        "dev3-back-contract",
        "dev3-back-google-sheet",
        "dev3-back-heartbeat",
        "dev3-back-infusionsoft",
        "dev3-back-notification",
        "dev3-back-paypal",
        "dev3-back-possale",
        "dev3-back-postback-gateway",
        "dev3-back-receipt",
        "dev3-back-refunded-subscription",
        "dev3-back-release",
        "dev3-back-sale-event",
        "dev3-back-smart-sale",
        "dev3-back-test",
        "dev3-back-voxuy",
        "dev3-gateway-test",
        "dev3-messages-test",
        "dev3-play-certificate",
        "dev3-play-members",
        "dev3-play-members-copy",
        "dev3-play-members-delete",
        "dev3-play-members-export",
        "dev3-play-members-subscription",
        "dev3-play-test",
      ]
    },
    {
      functionType = "Medium0"
      appName      = "fn-voomp-dev3-medium-us-0"
      memorySize   = 256
      timeout      = 30
      queues = [
        "dev3-back-ambassador-indication-last-days",
        "dev3-back-ambassador-remove-finisheds-indicated",
        "dev3-back-remove-admin-logs",
        "dev3-back-club",
        "dev3-back-export",
        "dev3-back-export-check",
        "dev3-back-export-upcoming-invoices",
        "dev3-back-payment",
        "dev3-back-pix",
        "dev3-back-webhook",
        "dev3-gateway-register",
        "dev3-gateway-send",
        "dev3-gateway2-webhook",        
        "dev3-gateway2-subscription-create-charge",
        "dev3-messages-gwhats-send",
        "dev3-messages-whatsapp-send",
        "dev3-play-media-transform",
        "dev3-play-members-import",
        "dev3-play-members-product",
      ]
    },
    {
      functionType = "High0"
      appName      = "fn-voomp-dev3-high-us-0"
      memorySize   = 512
      timeout      = 60
      queues = [
       "dev3-back-account-request-celcoin",
        "dev3-back-antecipation",
        "dev3-back-antifraude",
        "dev3-back-antifraude-geoip",
        "dev3-back-callback",
        "dev3-back-cosmos-postgraduate-sales",
        "dev3-back-email",
        "dev3-back-lead",
        "dev3-back-lead-abandon",
        "dev3-back-lead-checkout",
        "dev3-back-lead-store",
        "dev3-back-lead-update",
        "dev3-back-notas",
        "dev3-back-notas-emit",
        "dev3-back-pagarme",
        "dev3-back-pagarme-v5",
        "dev3-back-reconcile",
        "dev3-back-reconcile-import-process-transactions",
        "dev3-back-retorno-notas",
        "dev3-messages-email-send",
        "dev3-messages-receive",
        "dev3-play-callback",
        "dev3-play-email",
      ]
    },
  ]

  queue_overrides = {
    "dev3-play-test" = {
      visibility_timeout_seconds = 30
      dlq_max_receive_count      = 5
    }
  }

  sqs_queues_flattened = flatten([
    for app in local.fn_apps : [
      for q in app.queues : {
        queue_name    = q
        function_type = app.functionType
        app_name      = app.appName
      }
    ]
  ])

  sqs_queues_map = { for q in local.sqs_queues_flattened : q.queue_name => q }
}
*/
