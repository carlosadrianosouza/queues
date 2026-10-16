terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "seller-greenn-queues-tfstate-prd-123456789012-us-east-1-an"
    use_lockfile = true
    key          = "prd/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    #dynamodb_table = "voomp-queues-tflock"
    #bucket         = "voomp-queues-tfstate"
  }
}
