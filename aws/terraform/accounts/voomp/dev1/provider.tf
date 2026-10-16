provider "aws" {
  region = var.region

  default_tags {
    tags = {
      #ManagedBy     = "Terraform"
      Owner         = "Voomp"
      #Environment   = terraform.workspace
      Darede-CMGNEC = "devops"
      map-migrated  = "migT4GL1R9E0P"
      bu            = "voomp"      
      organization  = "cogna"
      project       = "voomp"
      provider      = "aws"
      terraform     = "true"
      type          = "voomp"
      version       = "1"      
      system        = "voomp"
      location      = "N. Virginia"      
      product      = "voomp"
      #environment  = "production"
      nature       = "operation"
      cost-center  = "1010780708"
      alliance     = "Alianca-3"
      journeys     = "voomp"
    }
  }
}
