terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Terraform Cloud Backend Configuration
  # This block will be active once the User connects TFC.
  # backend "remote" {
  #   organization = "lornu-ai"
  #   workspaces {
  #     name = "lornu-aws-staging"
  #   }
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "lornu-ai"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
