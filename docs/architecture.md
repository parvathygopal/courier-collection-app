# Courier Platform Architecture

Version: 1.0

## Project Status

| Stage                                    | Status         |
| ---------------------------------------- | -------------- |
| Stage 1 – Courier Collection Application | ✅ Completed   |
| Stage 2 – Courier Logistics Application  | ✅ Completed   |
| Stage 3 – Integration (Webhook + ETL)    | 🚧 In Progress |
| Stage 4 – Production Architecture        | 📋 Planned     |

Courier Platform Architecture

1. Overview

The Courier Platform consists of two independent applications that communicate through HTTP APIs.

Application Responsibility
Courier Collection Application (B2C) Customer-facing application where packages are created and tracked.
Courier Logistics Application (B2B) Internal logistics application responsible for moving packages across regions.

Each application owns its own database.

Communication happens only through APIs.

2. High Level Architecture
   Customer
   |
   |
   +-------------------+
   | Collection App |
   | (B2C) |
   +-------------------+
   |
   Webhook (Stage 3)
   |
   v
   +-------------------+
   | Logistics App |
   | (B2B) |
   +-------------------+
   |
   ETL Push
   |
   v
   +-------------------+
   | Collection App |
   +-------------------+
3. Stage 1 – Courier Collection Application
   Purpose

The Collection Application is the entry point of the courier lifecycle.

It is used by:

Customers
Front office executives

It is responsible for:

Package creation
Tracking ID generation
Customer tracking
Sale information
Responsibilities

Implemented:

Create packages
Generate Tracking ID
Store sale details
Customer tracking page
Front office dashboard

Does not manage:

Bags
Trucks
Regions
Internal logistics routing
You are acting as the lead software architect for this repository.

Before answering, read:

* AGENTS.md
* ROADMAP.md
* docs/architecture.md

Treat these documents as the source of truth.

Now inspect the entire codebase.

Compare the implementation with the roadmap and architecture.

Produce a report containing:

1. Completed features.
2. Partially completed features.
3. Missing features.
4. Bugs or inconsistencies.
5. Suggested improvements.

Then create a prioritized implementation plan.

Break the remaining work into tasks of approximately 30–60 minutes each.

For every task provide:

* Goal
* Files to modify
* Backend changes
* Frontend changes
* Database changes (if any)
* Acceptance criteria
* Suggested commit message

Do not generate code until I approve a task.


The Logistics Application manages internal package movement.

It is not customer-facing.

Responsibilities

Implemented:

Region Management
Package Management
Bag Management
Truck Management
Package → Bag Assignment
Bag → Truck Assignment
Package Status Updates
Dashboard APIs
Package Flow
Package
│
▼
Bag
│
▼
Truck
Status Flow
TO_BE_PICKED_UP
│
▼
PICKED_UP
│
▼
ADDED_TO_BAG
│
▼
EN_ROUTE
│
▼
ARRIVED_AT_REGION
│
▼
SCHEDULED_FOR_DELIVERY
│
▼
OUT_FOR_DELIVERY

(Use ARRIVED_AT_REGION if that's the actual enum.)

Dashboard

Displays:

Packages waiting to be bagged
Packages received from incoming trucks
Packages already loaded onto trucks
Delayed packages 5. Stage 3 – Application Integration

Status: Planned / In Progress

This stage integrates the Collection and Logistics applications.

Webhook Flow

When a package is created in Collection:

Collection
│
POST /webhooks/packages
│
▼
Logistics

Example:

{
"trackingId": "...",
"sourceRegionCode": "...",
"destinationRegionCode": "..."
}
Authentication

Every webhook request contains:

x-api-key
x-timestamp
x-signature

The signature is generated using HMAC SHA256.

The Logistics Application validates:

API key
Timestamp
Signature

before processing.

Idempotency

Tracking ID acts as the idempotency key.

If the same package is received twice:

Tracking ID = ABC123

↓

Already Exists

↓

Ignore Duplicate
Queue Processing (Future Enhancement)

To prevent heavy webhook processing:

Webhook

↓

Queue

↓

Worker

↓

Database

Current implementation processes requests synchronously.

A message queue can be introduced later for scalability.

ETL Synchronization

The Logistics Application periodically sends package status updates to Collection.

Logistics

↓

Raw Status Updates

↓

Collection

Development:

Every 1 minute

Production:

Every 6 hours
Raw Updates

Collection stores:

Incoming payload
Processing status
Timestamp

Purpose:

Auditing
Replay
Debugging
Transformation

Example:

Internal logistics status:

Loaded to truck

Customer sees:

Package in transit

This allows internal operational details to remain hidden.

6. Security

The Collection Application should never expose:

Truck IDs
Bag IDs
Internal warehouse identifiers
Internal routing information

Only simplified customer statuses are returned.

7. Future Enhancements

These are not part of the current implementation but can be introduced for production deployment.

Reliability
Retry mechanism
Exponential backoff
Dead Letter Queue
Offset tracking
Scalability
Queue-based webhook processing
Horizontal scaling
Worker processes
Cloud Deployment (AWS)

Possible managed services:

Requirement AWS Service
Containers ECS
Database RDS PostgreSQL
Queue SQS
Notifications SNS
Object Storage S3
Monitoring CloudWatch
Secrets Secrets Manager 8. Non-Functional Requirements
Reliability
Idempotency
Audit trail
Retry support
Security
API Keys
HMAC Signatures
Environment-based secrets
Scalability
Stateless APIs
Queue-based processing
Independent services
Maintainability
Controller → Service architecture
Prisma ORM
Standardized error handling
Zod validation
Modular project structure
