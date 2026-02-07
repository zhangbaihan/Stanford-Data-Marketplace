# github-actions.tf
# Defines the IAM OIDC provider and role for GitHub Actions to securely deploy to AWS

# --- IAM OIDC Provider for GitHub ---
# This tells AWS to trust GitHub as an OIDC provider.
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d9c60c1c4c516e989f2652b0ade842b81"] # Standard thumbprint for GitHub OIDC
}

# --- IAM Role for GitHub Actions ---
resource "aws_iam_role" "github_actions_role" {
  name = "github-actions-role"

  # Trust policy that allows GitHub Actions to assume this role.
  # It is scoped to your specific GitHub repository.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_username}/${var.project_name}:*"
          }
        }
      },
    ]
  })

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- IAM Policy for GitHub Actions ---
# This policy grants the specific permissions that the GitHub Actions workflow needs.
resource "aws_iam_policy" "github_actions_policy" {
  name        = "github-actions-policy"
  description = "Policy for GitHub Actions to deploy the application"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          # Permissions for ECR
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
          # Permissions for ECS
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
          # Permissions for S3
          "s3:ListBucket",
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          # Permissions for CloudFront
          "cloudfront:CreateInvalidation"
        ]
        Resource = "*" # For simplicity. In production, you would restrict this to specific resources.
      },
    ]
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "github_actions_policy_attachment" {
  role       = aws_iam_role.github_actions_role.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}

# --- Outputs ---
output "github_actions_role_arn" {
  description = "The ARN of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions_role.arn
}