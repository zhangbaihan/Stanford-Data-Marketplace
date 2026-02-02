# ecs.tf
# Defines the ECS Cluster, IAM Roles, Security Groups, Task Definition, and Service for the server application

# --- ECS Cluster ---
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- IAM Roles for ECS ---

# IAM Role for ECS Task Execution
# This role grants permissions to the ECS agent to pull images from ECR and publish logs to CloudWatch.
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
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

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additionally, allow the task execution role to read secrets from Secrets Manager
resource "aws_iam_role_policy" "ecs_secrets_access" {
  name = "${var.project_name}-ecs-secrets-access"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [aws_secretsmanager_secret.mongodb_uri.arn]
      },
    ]
  })
}


# IAM Role for ECS Task
# This role is assumed by the application running inside the container (our Node.js server).
# It grants permissions that our application might need, e.g., to interact with S3.
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
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

# Attach policy for S3 access (e.g., for uploading datasets)
# Assuming your server needs full S3 access for now.
# In a production environment, you would restrict this to specific buckets and actions.
resource "aws_iam_role_policy_attachment" "ecs_task_s3_full_access" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess" # TODO: Restrict permissions
}


# --- Security Group for ECS Tasks ---
# Allows inbound traffic to the server application
resource "aws_security_group" "ecs_service" {
  name_prefix = "${var.project_name}-ecs-service-"
  description = "Allow inbound traffic to ECS service"
  vpc_id      = module.vpc.vpc_id

  # Allow inbound from ALB
  ingress {
    from_port       = 5001 # Server application port
    to_port         = 5001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id] # Only allow traffic from the ALB
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # All protocols
    cidr_blocks = ["0.0.0.0/0"] # Allow all outbound traffic
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- CloudWatch Log Group for ECS Tasks ---
resource "aws_cloudwatch_log_group" "server" {
  name              = "/ecs/${var.project_name}-server"
  retention_in_days = 7 # Adjust as needed

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}


# --- ECS Task Definition for Server ---
resource "aws_ecs_task_definition" "server" {
  family                   = "${var.project_name}-server"
  cpu                      = "256"    # 0.25 vCPU
  memory                   = "512"    # 512MB
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn # For pulling images and logging
  task_role_arn            = aws_iam_role.ecs_task_role.arn            # For application-level permissions (e.g., S3)

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-server-container"
      image     = aws_ecr_repository.server.repository_url # ECR image URL
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 5001
          hostPort      = 5001
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "5001"
        },
        # Any other non-sensitive environment variables
      ]
      secrets = [ # Inject MongoDB URI from Secrets Manager
        {
          name      = "MONGODB_URI"
          valueFrom = aws_secretsmanager_secret.mongodb_uri.arn
        },
        # TODO: Add other secrets like SESSION_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
        # These should also be stored in Secrets Manager.
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.server.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- ECS Service for Server ---
resource "aws_ecs_service" "server" {
  name            = "${var.project_name}-server-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.server.arn
  desired_count   = 1 # Start with 1 instance of our server
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets # Tasks live in private subnets
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = false # Tasks do not need public IPs
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.server.arn
    container_name   = "${var.project_name}-server-container"
    container_port   = 5001
  }

  # Allow deployment to proceed even if the previous one is still in progress
  # This is often used for faster deployments in dev environments.
  # For production, you might want more stringent controls.
  # deployment_minimum_healthy_percent = 50
  # deployment_maximum_percent = 200

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }

  # Ensure the ALB, target group, and ECS cluster are created before the service
  depends_on = [
    aws_lb_listener.http,
    aws_lb_target_group.server,
    aws_ecs_cluster.main,
    aws_cloudwatch_log_group.server,
  ]
}

# --- Outputs ---
output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_service_security_group_id" {
  description = "ID of the security group for ECS service"
  value       = aws_security_group.ecs_service.id
}

output "server_ecs_service_name" {
  description = "The name of the ECS service for the backend"
  value       = aws_ecs_service.server.name
}

output "server_task_definition_arn" {
  description = "The ARN of the ECS task definition for the backend"
  value       = aws_ecs_task_definition.server.arn
}
