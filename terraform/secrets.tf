# secrets.tf
# Defines secrets for the application, stored in AWS Secrets Manager

resource "aws_secretsmanager_secret" "mongodb_uri" {
  name = "${var.project_name}-mongodb-uri"
  description = "MongoDB URI for the Stanford Data Marketplace application"

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

output "mongodb_uri_secret_arn" {
  description = "The ARN of the MongoDB URI secret in AWS Secrets Manager"
  value       = aws_secretsmanager_secret.mongodb_uri.arn
}
