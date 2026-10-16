
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project
    ManagedBy   = "Terraform"
  }

  fn_apps = [
    {
      functionType = "Low0"
      appName      = "fn-voomp-prd-low-bs-0"
      memorySize   = 128
      timeout      = 30
      queues = [
        "back-affiliates",
        # "back-analysis",
        # "back-call-evaluation",
        # "back-capi",
        # "back-contract",
        # "back-google-sheet",
        # "back-heartbeat",
        # "back-infusionsoft",
        # "back-notification",
        # "back-paypal",
        # "back-possale",
        # "back-postback-gateway",
        # "back-receipt",
        # "back-refunded-subscription",
        # "back-sale-event",
        # "back-smart-sale",
        # "back-test",
        # "back-voxuy",
        # "gateway-test",
        # "messages-test",
        # "play-certificate",
        # "play-members",
        # "play-members-copy",
        # "play-members-delete",
        # "play-members-export",
        # "play-members-subscription",
        # "play-test",
      ]
    },
    {
      functionType = "Medium0"
      appName      = "fn-voomp-prd-medium-bs-0"
      memorySize   = 256
      timeout      = 30
      queues = [
        # "back-ambassador-indication-last-days",
        # "back-ambassador-remove-finisheds-indicated",
        # "back-remove-admin-logs",
        # "back-club",
        # "back-export",
        # "back-export-check",
        # "back-export-upcoming-invoices",
        # "back-payment",
        # "back-pix",
        # "back-webhook",
        # "back-release",
        # "gateway-register",
        # "gateway-send",
        # "messages-gwhats-send",
        # "messages-whatsapp-send",
        # "play-media-transform",
        # "play-members-import",
        #"play-members-product",
      ]
    },
    {
      functionType = "High0"
      appName      = "fn-voomp-prd-high-bs-0"
      memorySize   = 512
      timeout      = 60
      queues = [
        # "back-antecipation",
        # "back-antifraude",
        # "back-antifraude-geoip",
        # "back-callback",
        # "back-lead",
        # "back-lead-abandon",
        # "back-lead-checkout",
        # "back-lead-store",
        # "back-lead-update",
        # "back-pagarme",
        # "play-callback",
        #"play-cogna-ai",
      ]
    },
    {
      functionType = "High1"
      appName      = "fn-voomp-prd-high-bs-1"
      memorySize   = 512
      timeout      = 60
      queues = [
        # "play-email",
        # "back-email",
        # "messages-receive",
        # "messages-email-send",
        # "back-notas",
        # "back-notas-emit",
        # "back-retorno-notas",
        # "back-reconcile",
        #"back-reconcile-import-process-transactions",
      ]
    },
  ]

  queue_overrides = {
    "back-affiliates" = {
      visibility_timeout_seconds = 88
      dlq_max_receive_count      = 5
    }
    "back-reconcile-import-process-transactions" = {
      visibility_timeout_seconds = 300
      message_retention_seconds  = 604800
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

