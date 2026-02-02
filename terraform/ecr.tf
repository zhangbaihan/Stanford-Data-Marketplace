# ecr.tf
# Defines the ECR repositories for our client and server applications

resource "aws_ecr_repository" "client" {
  name                 = "${var.github_username}/${var.project_name}-client"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

resource "aws_ecr_repository" "server" {
  name                 = "${var.github_username}/${var.project_name}-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- Outputs ---
output "client_ecr_repository_url" {
  description = "The URL of the client ECR repository"
  value       = aws_ecr_repository.client.repository_url
}

output "server_ecr_repository_url" {
  description = "The URL of the server ECR repository"
  value       = aws_ecr_repository.server.repository_url
}