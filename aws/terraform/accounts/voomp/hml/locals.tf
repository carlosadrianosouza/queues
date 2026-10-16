/*
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project
    ManagedBy   = "Terraform"
  }

  # --- Lambda Apps (1 Lambda per tier, N queues per Lambda) ---

  fn_apps = [
    {
      functionType = "Low0"
      appName      = "fn-voomp-hml-low-eu-0"
      memorySize   = 128
      timeout      = 30
      queues = [
        "back-affiliates",
        "back-analysis",
        "back-call-evaluation",
        "back-capi",
        "back-contract",
        "back-google-sheet",
        "back-heartbeat",
        "back-infusionsoft",
        "back-notification",
        "back-paypal",
        "back-possale",
        "back-postback-gateway",
        "back-receipt",
        "back-refunded-subscription",
        "back-release",
        "back-sale-event",
        "back-smart-sale",
        "back-test",
        "back-voxuy",
        "gateway-test",
        "messages-test",
        "play-certificate",
        "play-members",
        "play-members-copy",
        "play-members-delete",
        "play-members-export",
        "play-members-subscription",
        "play-test",
      ]
    },
    {
      functionType = "Medium0"
      appName      = "fn-voomp-hml-medium-eu-0"
      memorySize   = 256
      timeout      = 30
      queues = [
        "back-ambassador-indication-last-days",
        "back-ambassador-remove-finisheds-indicated",
        "back-remove-admin-logs",
        "back-club",
        "back-export",
        "back-export-check",
        "back-export-upcoming-invoices",
        "back-payment",
        "back-pix",
        "back-webhook",
        "gateway-register",
        "gateway-send",
        "gateway2-webhook",
        "gateway2-subscription-create-charge",
        "messages-gwhats-send",
        "messages-whatsapp-send",
        "play-media-transform",
        "play-members-import",
        "play-members-product",
      ]
    },
    {
      functionType = "High0"
      appName      = "fn-voomp-hml-high-eu-0"
      memorySize   = 512
      timeout      = 60
      queues = [
        "back-account-request-celcoin",
        "back-antecipation",        
        "back-antifraude",
        "back-antifraude-geoip",
        "back-callback",
        "back-cosmos-postgraduate-sales",
        "back-email",
        "back-lead",
        "back-lead-abandon",
        "back-lead-checkout",
        "back-lead-store",
        "back-lead-update",
        "back-notas",
        "back-notas-emit",
        "back-pagarme",
        "back-pagarme-v5",
        "back-reconcile",
        "back-reconcile-import-process-transactions",
        "back-retorno-notas",
        "messages-email-send",
        "messages-receive",
        "play-callback",
        "play-email",
      ]
    },
  ]

  # --- SQS Queues (flattened for the SQS module) ---

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

  # --- Per-queue overrides ---

  queue_overrides = {
    "back-antecipation" = {
      visibility_timeout_seconds = 65
      dlq_max_receive_count      = 5
    }
  }
}
*/
