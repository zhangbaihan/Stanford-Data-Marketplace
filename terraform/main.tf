# main.tf
# Defines the AWS provider and common variables

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# --- Data Sources ---
# Get the availability zones in the current region
data "aws_availability_zones" "available" {}

# --- VPC ---
# Creates a Virtual Private Cloud to host our resources.
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.project_name}-vpc" # Stanford Data Marketplace VPC
  cidr = "10.0.0.0/16"

  azs             = data.aws_availability_zones.available.names
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}