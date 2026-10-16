/*
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  fn_apps = [
    {
      functionType = "Low0"
      appName      = "fn-voomp-dev1-low-us-0"
      memorySize   = 128
      timeout      = 30
      queues = [
        "dev1-back-affiliates",
        "dev1-back-analysis",
        "dev1-back-call-evaluation",
        "dev1-back-capi",
        "dev1-back-contract",
        "dev1-back-google-sheet",
        "dev1-back-heartbeat",
        "dev1-back-infusionsoft",
        "dev1-back-notification",
        "dev1-back-paypal",
        "dev1-back-possale",
        "dev1-back-postback-gateway",
        "dev1-back-receipt",
        "dev1-back-refunded-subscription",
        "dev1-back-release",
        "dev1-back-sale-event",
        "dev1-back-smart-sale",
        "dev1-back-test",
        "dev1-back-voxuy",
        "dev1-gateway-test",
        "dev1-messages-test",
        "dev1-play-certificate",
        "dev1-play-members",
        "dev1-play-members-copy",
        "dev1-play-members-delete",
        "dev1-play-members-export",
        "dev1-play-members-subscription",
        "dev1-play-test",
      ]
    },
    {
      functionType = "Medium0"
      appName      = "fn-voomp-dev1-medium-us-0"
      memorySize   = 256
      timeout      = 30
      queues = [
        "dev1-back-ambassador-indication-last-days",
        "dev1-back-ambassador-remove-finisheds-indicated",
        "dev1-back-remove-admin-logs",
        "dev1-back-club",
        "dev1-back-export",
        "dev1-back-export-check",
        "dev1-back-export-upcoming-invoices",
        "dev1-back-payment",
        "dev1-back-pix",
        "dev1-back-webhook",
        "dev1-gateway-register",
        "dev1-gateway-send",
        "dev1-gateway2-webhook",        
        "dev1-gateway2-subscription-create-charge",
        "dev1-messages-gwhats-send",
        "dev1-messages-whatsapp-send",
        "dev1-play-media-transform",
        "dev1-play-members-import",
        "dev1-play-members-product",
      ]
    },
    {
      functionType = "High0"
      appName      = "fn-voomp-dev1-high-us-0"
      memorySize   = 512
      timeout      = 60
      queues = [
       "dev1-back-account-request-celcoin",
        "dev1-back-antecipation",
        "dev1-back-antifraude",
        "dev1-back-antifraude-geoip",
        "dev1-back-callback",
        "dev1-back-cosmos-postgraduate-sales",
        "dev1-back-email",
        "dev1-back-lead",
        "dev1-back-lead-abandon",
        "dev1-back-lead-checkout",
        "dev1-back-lead-store",
        "dev1-back-lead-update",
        "dev1-back-notas",
        "dev1-back-notas-emit",
        "dev1-back-pagarme",
        "dev1-back-pagarme-v5",
        "dev1-back-reconcile",
        "dev1-back-reconcile-import-process-transactions",
        "dev1-back-retorno-notas",
        "dev1-messages-email-send",
        "dev1-messages-receive",
        "dev1-play-callback",
        "dev1-play-email",
      ]
    },
  ]

  queue_overrides = {
    "dev1-play-test" = {
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
