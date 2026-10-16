/*
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  fn_apps = [
    {
      functionType = "Low0"
      appName      = "fn-voomp-dev2-low-us-0"
      memorySize   = 128
      timeout      = 30
      queues = [
        "dev2-back-affiliates",
        "dev2-back-analysis",
        "dev2-back-call-evaluation",
        "dev2-back-capi",
        "dev2-back-contract",
        "dev2-back-google-sheet",
        "dev2-back-heartbeat",
        "dev2-back-infusionsoft",
        "dev2-back-notification",
        "dev2-back-paypal",
        "dev2-back-possale",
        "dev2-back-postback-gateway",
        "dev2-back-receipt",
        "dev2-back-refunded-subscription",
        "dev2-back-release",
        "dev2-back-sale-event",
        "dev2-back-smart-sale",
        "dev2-back-test",
        "dev2-back-voxuy",
        "dev2-gateway-test",
        "dev2-messages-test",
        "dev2-play-certificate",
        "dev2-play-members",
        "dev2-play-members-copy",
        "dev2-play-members-delete",
        "dev2-play-members-export",
        "dev2-play-members-subscription",
        "dev2-play-test",
      ]
    },
    {
      functionType = "Medium0"
      appName      = "fn-voomp-dev2-medium-us-0"
      memorySize   = 256
      timeout      = 30
      queues = [
        "dev2-back-ambassador-indication-last-days",
        "dev2-back-ambassador-remove-finisheds-indicated",
        "dev2-back-remove-admin-logs",
        "dev2-back-club",
        "dev2-back-export",
        "dev2-back-export-check",
        "dev2-back-export-upcoming-invoices",
        "dev2-back-payment",
        "dev2-back-pix",
        "dev2-back-webhook",
        "dev2-gateway-register",
        "dev2-gateway-send",
        "dev2-gateway2-webhook",        
        "dev2-gateway2-subscription-create-charge",
        "dev2-messages-gwhats-send",
        "dev2-messages-whatsapp-send",
        "dev2-play-media-transform",
        "dev2-play-members-import",
        "dev2-play-members-product",
      ]
    },
    {
      functionType = "High0"
      appName      = "fn-voomp-dev2-high-us-0"
      memorySize   = 512
      timeout      = 60
      queues = [
       "dev2-back-account-request-celcoin",
        "dev2-back-antecipation",
        "dev2-back-antifraude",
        "dev2-back-antifraude-geoip",
        "dev2-back-callback",
        "dev2-back-cosmos-postgraduate-sales",
        "dev2-back-email",
        "dev2-back-lead",
        "dev2-back-lead-abandon",
        "dev2-back-lead-checkout",
        "dev2-back-lead-store",
        "dev2-back-lead-update",
        "dev2-back-notas",
        "dev2-back-notas-emit",
        "dev2-back-pagarme",
        "dev2-back-pagarme-v5",
        "dev2-back-reconcile",
        "dev2-back-reconcile-import-process-transactions",
        "dev2-back-retorno-notas",
        "dev2-messages-email-send",
        "dev2-messages-receive",
        "dev2-play-callback",
        "dev2-play-email",
      ]
    },
  ]

  queue_overrides = {
    "dev2-play-test" = {
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
