terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {    
    bucket = "seller-greenn-queues-tfstate-hml-748341875172-us-east-1-an"
    key    = "hml/terraform.tfstate"
    region = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
