variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "app_name" {
  description = "Application name used for naming resources"
  type        = string
  default     = "serene-stay"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "devops_aws"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  type        = string
  default     = "serene-stay-uploads"
}