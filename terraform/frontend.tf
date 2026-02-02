# frontend.tf
# Defines resources for deploying the React frontend application to S3 and CloudFront

# --- S3 Bucket for Frontend Hosting ---
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "${var.project_name}-frontend-${var.github_username}" # Unique bucket name

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

resource "aws_s3_bucket_ownership_controls" "frontend_bucket_ownership" {
  bucket = aws_s3_bucket.frontend_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_public_access_block" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- CloudFront Distribution for Frontend ---
# To secure communication between CloudFront and S3, we use Origin Access Control (OAC).
resource "aws_cloudfront_origin_access_control" "frontend_oac" {
  name                              = "${var.project_name}-frontend-oac"
  description                       = "OAC for S3 frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend_distribution" {
  # --- S3 Origin (for frontend static files) ---
  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.frontend_bucket.id
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id
  }

  # --- ALB Origin (for backend API calls) ---
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb-origin" # Custom ID for the ALB origin

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only" # CloudFront will talk to ALB over HTTP
      origin_ssl_protocols     = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for ${var.project_name} frontend"
  default_root_object = "index.html" # Your React app's entry point

  # --- Default Cache Behavior (for S3 frontend files) ---
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = aws_s3_bucket.frontend_bucket.id
    viewer_protocol_policy = "redirect-to-https" # Always use HTTPS
    min_ttl                = 0
    default_ttl            = 86400 # 1 day
    max_ttl                = 31536000 # 1 year

    forwarded_values {
      query_string = true # Forward query strings to S3
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"] # Required for CORS
      cookies {
        forward = "none" # Static site doesn't need cookies forwarded
      }
    }
  }

  # --- API Cache Behavior (for /api/* requests) ---
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "alb-origin" # Route to the ALB origin
    viewer_protocol_policy = "https-only" # Ensure API calls are HTTPS
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["*"] # Forward all headers to the API
      cookies {
        forward = "all" # Forward cookies to the API for session management
      }
    }
  }

  # Error pages (important for React Router with client-side routing)
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Price class (default to all edge locations for global reach)
  price_class = "PriceClass_100" # US, Europe, Asia, Africa

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # Use CloudFront's default certificate for now
    # We will replace this with an ACM certificate once we set up custom domain
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
    "Project"     = var.project_name
  }
}

# --- S3 Bucket Policy to allow CloudFront Access ---
data "aws_iam_policy_document" "s3_policy_cloudfront_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend_bucket.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend_distribution.arn] # Corrected to use distribution ARN
    }
  }
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  policy = data.aws_iam_policy_document.s3_policy_cloudfront_access.json
}

# --- Outputs ---
output "frontend_bucket_name" {
  description = "Name of the S3 bucket for the frontend"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution (for frontend)"
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
}