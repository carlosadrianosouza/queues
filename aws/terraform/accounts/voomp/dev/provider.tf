provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project
      ManagedBy   = "Terraform"
      map-migrated = "migT4GL1R9E0P"      
    }
  }
}
