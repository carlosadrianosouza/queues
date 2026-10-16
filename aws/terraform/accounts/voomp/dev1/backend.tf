terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    #bucket         = "voomp-queues-tfstate"
    #bucket = "seller-greenn-queues-terraform-state"
    bucket = "seller-greenn-queues-tfstate-dev1-238543389769-us-east-1-an"

    key    = "dev1/terraform.tfstate"
    region = "us-east-1"
    #dynamodb_table = "voomp-queues-tflock"
    use_lockfile = true

    encrypt = true
  }
}

