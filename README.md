# Serene Stay — Hotel Booking App

A full-stack hotel booking application built with Next.js, Prisma ORM, and PostgreSQL, deployed on AWS using the Well-Architected Framework.

## Tech Stack

- Next.js 16 (App Router, SSR)
- Prisma ORM v7 with PostgreSQL adapter
- AWS Amplify (hosting and CI/CD)
- AWS RDS PostgreSQL (database)
- AWS S3 (file storage)
- GitHub Actions (CI pipeline)

## AWS Well-Architected Pillars

### Operational Excellence
- CI/CD pipeline via AWS Amplify connected to GitHub
- GitHub Actions workflow for lint and type checking on every push
- CloudWatch logs enabled for runtime monitoring

### Security
- IAM user with least privilege permissions
- Environment variables stored in AWS SSM Parameter Store
- S3 bucket with public access blocked
- SSL encryption on all database connections
- File upload validation — type and size restricted

### Reliability
- RDS PostgreSQL with automated daily backups
- Amplify automatic rollback on failed deployments
- Database connection pooling with max 10 connections
- Error handling on all API routes with proper HTTP status codes

### Performance Efficiency
- Next.js SSR for dynamic pages
- Static generation for homepage and about page
- Database queries use pagination to avoid loading all records
- Connection pooling to reuse database connections

### Cost Optimization
- RDS db.t3.micro instance — free tier eligible
- Amplify serverless hosting — pay only for usage
- S3 standard storage — minimal cost for student project

### Sustainability
- Serverless architecture — no idle EC2 instances
- Single region deployment minimizes unnecessary replication
- Connection pooling reduces database resource usage

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/users | List all users with pagination |
| POST | /api/users | Create a new user |
| GET | /api/posts | List all posts with pagination |
| POST | /api/posts | Create a new post |
| GET | /api/posts/[id] | Get a single post |
| PUT | /api/posts/[id] | Update a post |
| DELETE | /api/posts/[id] | Delete a post |
| GET | /api/rooms | List all rooms |
| POST | /api/rooms | Create a room |
| GET | /api/bookings | List all bookings |
| POST | /api/bookings | Create a booking |
| POST | /api/upload | Upload image to S3 |

## Local Development

Install dependencies and run locally:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Environment Variables

Create a `.env.local` file with these variables:

```env
DATABASE_URL=
APP_REGION=
APP_S3_BUCKET=
APP_ACCESS_KEY_ID=
APP_SECRET_ACCESS_KEY=
```

## Deployment

Push to main branch and Amplify automatically builds and deploys.