# variables.tf
# Defines common variables used across the Terraform configuration

variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Name of the project, used as a prefix for resources"
  type        = string
  default     = "stanford-data-marketplace"
}

variable "github_username" {
  description = "Your GitHub username, used to create unique resource names."
  type        = string
  default     = "zhangbaihan"
}

variable "domain_name" {
  description = "The domain name for the application (e.g., example.com)"
  type        = string
  # No default here, as it should be provided by the user
  # We will eventually need this value
}