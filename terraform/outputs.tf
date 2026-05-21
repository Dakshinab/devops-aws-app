output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.uploads.arn
}

output "app_user_name" {
  description = "IAM user name for the application"
  value       = aws_iam_user.app_user.name
}