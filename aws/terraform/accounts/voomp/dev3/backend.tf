terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {    
    bucket = "seller-greenn-queues-tfstate-dev3-238543389769-us-east-1-an"
    key    = "dev3/terraform.tfstate"
    region = "us-east-1"    
    use_lockfile = true
    encrypt = true
  }
}

