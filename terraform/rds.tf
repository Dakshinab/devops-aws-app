resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name    = "${var.app_name}-subnet-group"
    Project = var.app_name
  }
}

resource "aws_db_instance" "main" {
  identifier        = "${var.app_name}-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = true
  skip_final_snapshot = true

  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  auto_minor_version_upgrade = true
  deletion_protection        = false

  tags = {
    Name        = "${var.app_name}-db"
    Environment = "production"
    Project     = var.app_name
  }
}