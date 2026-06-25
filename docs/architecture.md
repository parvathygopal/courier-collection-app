# Courier Platform Architecture

## Overview

The platform consists of three independent systems:

1. Courier Collection Application (B2C)
2. Courier Logistics Application (B2B)
3. Support System

Each system owns its own data and communicates only through APIs.

---

# System Architecture

```text
Customer
    |
    v
+----------------------+
| Collection App       |
| (B2C)                |
+----------------------+
    |
    | Webhook
    v
+----------------------+
| Logistics App        |
| (B2B)                |
+----------------------+
    |
    | ETL Push
    v
+----------------------+
| Collection App       |
+----------------------+

          |
          v

+----------------------+
| Support System       |
+----------------------+
```

---

# Stage 1

## Collection Application

Responsibilities:

- Create packages
- Generate tracking IDs
- Customer package tracking
- Display simplified status updates

Owns:

- Package
- Tracking History
- Customer Views

Does not own:

- Trucks
- Bags
- Regions
- Internal logistics operations

---

# Stage 2

## Logistics Application

Responsibilities:

- Region management
- Bag management
- Truck management
- Package movement
- Package status updates

Package Flow:

```text
Package
   |
   v
Bag
   |
   v
Truck
```

Status Flow:

```text
TO_BE_PICKED_UP
↓
PICKED_UP
↓
ADDED_TO_BAG
↓
EN_ROUTE
↓
ARRIVED_AT_REGION
↓
SCHEDULED_FOR_DELIVERY
↓
OUT_FOR_DELIVERY
```

---

# Stage 3

## Webhook Integration

Collection Application creates packages.

Logistics Application receives package creation requests through a webhook endpoint.

Flow:

```text
Collection App
    |
    | POST /webhooks/packages
    |
    v
Logistics App
```

Example Payload:

```json
{
  "trackingId": "TRK123",
  "sourceRegionId": "region-1",
  "destinationRegionId": "region-2"
}
```

---

## Authentication

Every customer receives:

- API Key
- Signing Secret

Requests contain:

```http
x-api-key
x-signature
```

The signature is generated using HMAC SHA256.

---

## Idempotency

The system must reject duplicate package creation requests.

Tracking ID acts as the idempotency key.

Example:

```text
TRK123
TRK123
```

Second request should not create another package.

---

## Queue Processing

Webhook requests should not perform heavy processing.

Flow:

```text
Webhook
   |
   v
Queue
   |
   v
Worker
   |
   v
Database
```

Benefits:

- Prevent overload
- Retry support
- Better scalability

---

# Stage 4

## ETL Synchronization

Logistics Application periodically pushes package updates.

Flow:

```text
Logistics App
    |
    | ETL Push
    v
Collection App
```

Schedule:

- Every 4 hours in production
- Every 1 minute in development

---

## ETL Payload

Logistics system owns detailed information.

Example:

```json
{
  "trackingId": "TRK123",
  "truckId": "TRK-001",
  "bagId": "BAG-001",
  "status": "EN_ROUTE",
  "eventTime": "2026-01-01T10:00:00Z"
}
```

Collection application stores:

- Raw payload
- Processed payload

---

## Raw Update Storage

Purpose:

- Auditing
- Replay
- Debugging

Table:

```text
raw_updates
```

Columns:

- id
- payload
- received_at
- processed
- processed_at

---

## Transformation Layer

Raw updates are transformed into customer-friendly tracking statuses.

Example:

Logistics:

```text
Truck sealed
Loaded to truck
Arrived at warehouse
```

Customer View:

```text
Package in transit
```

---

# Retry Strategy

ETL delivery uses exponential backoff.

Example:

```text
10 seconds
20 seconds
40 seconds
80 seconds
120 seconds
```

Maximum retry count:

```text
5
```

After that:

```text
FAILED
```

Customer is notified.

---

# Offset Tracking

ETL jobs must track successful deliveries.

Store:

```text
lastSuccessfulOffset
```

or

```text
lastSuccessfulTimestamp
```

Purpose:

- Avoid data loss
- Replay failed batches

---

# Customer Validation

Before ETL push:

Validate:

- Customer active
- API key valid
- Endpoint reachable

If customer continuously fails:

```text
ACTIVE
↓
WARNING
↓
DISABLED
```

Notifications are sent automatically.

---

# Support System

Support users receive read-only access.

Responsibilities:

- Package investigation
- Delay analysis
- Refund support
- Escalations

Support users must not:

- Modify package status
- Create packages
- Update logistics data

---

# Security

Never expose:

- Internal truck identifiers
- Internal warehouse identifiers
- Infrastructure topology
- Database information

Customer APIs should expose only:

```json
{
  "trackingId": "TRK123",
  "status": "EN_ROUTE"
}
```

---

# AWS Future Architecture

Possible services:

API Layer:

- API Gateway

Application Layer:

- ECS
- EKS

Queue:

- SQS

Notifications:

- SNS

Database:

- RDS PostgreSQL

Object Storage:

- S3

Monitoring:

- CloudWatch

Secrets:

- Secrets Manager

---

# Non Functional Requirements

Reliability:

- Idempotency
- Retry support
- Audit trail

Scalability:

- Horizontal scaling
- Queue based processing

Security:

- API Keys
- HMAC Signatures
- Environment based secrets

Observability:

- Logs
- Metrics
- Tracing

Maintainability:

- Controller / Service architecture
- Prisma data layer
- Standardized error handling
