# alb.tf
# Defines the Application Load Balancer (ALB) and associated resources

# --- ALB Security Group ---
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-sg-"
  description = "Allow HTTP/HTTPS access to ALB"
  vpc_id      = module.vpc.vpc_id

  # Ingress rules
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow HTTP from anywhere
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow HTTPS from anywhere
  }

  # Egress rule: allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- Application Load Balancer ---
resource "aws_lb" "main" {
  name_prefix        = "sdm-a-" # Corrected prefix (<=6 characters)
  load_balancer_type = "application"
  subnets            = module.vpc.public_subnets # ALB lives in public subnets
  security_groups    = [aws_security_group.alb.id]
  internal           = false # Public-facing ALB

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- ALB Target Group for Server ---
resource "aws_lb_target_group" "server" {
  name_prefix = "sdm-s-" # Corrected prefix (<=6 characters)
  port        = 5001 # Your Node.js server listens on port 5001
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip" # <--- IMPORTANT: Changed from "instance" to "ip" for Fargate

  health_check {
    path                = "/" # Assuming your server has a health check endpoint at "/"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- ALB Listener (HTTP) ---
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.server.arn
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }

  # Force replacement if target group changes. This ensures the listener always points to the correct TG.
  lifecycle {
    replace_triggered_by = [
      aws_lb_target_group.server.arn,
    ]
  }
}

# --- ALB Listener (HTTPS) ---
# We will uncomment and configure this once we have ACM certificates for HTTPS
/*
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08" # Or a more recent one
  certificate_arn   = "YOUR_ACM_CERTIFICATE_ARN_HERE" # Placeholder

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.server.arn
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}
*/

# --- Outputs ---
output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_target_group_arn" {
  description = "The ARN of the ALB target group for the server"
  value       = aws_lb_target_group.server.arn
}
