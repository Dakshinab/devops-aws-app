resource "aws_iam_policy" "app_policy" {
  name        = "${var.app_name}-app-policy"
  description = "Least privilege policy for Serene Stay application"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3AppAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      },
      {
        Sid    = "CloudWatchAccess"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_user" "app_user" {
  name = "${var.app_name}-app-user"

  tags = {
    Name    = "${var.app_name}-app-user"
    Project = var.app_name
  }
}

resource "aws_iam_user_policy_attachment" "app_user_policy" {
  user       = aws_iam_user.app_user.name
  policy_arn = aws_iam_policy.app_policy.arn
}