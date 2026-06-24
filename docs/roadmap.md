# ROADMAP

## Stage 1

Courier Collection App

Status: COMPLETE

- Package creation
- Tracking
- Status history

---

## Stage 2

Courier Logistics App

Status: COMPLETE

- Regions
- Bags
- Trucks
- Assign package to bag
- Assign bag to truck
- Dashboard

---

## Stage 3

Webhook Integration

Status: In Progress

### Logistics App

Build:

POST /webhooks/packages

Requirements:

- API key validation
- Idempotency
- Queue processing

### Collection App

Build:

Webhook registration

Requirements:

- Store logistics endpoint
- Store API key

---

## Stage 4

ETL Synchronization

Status: TODO

### Logistics App

Build:

- ETL scheduler
- Retry logic
- Offset tracking

### Collection App

Build:

- Raw ETL table
- Transformation layer
- Status mapping

---

## Future

- AWS deployment
- SQS
- SNS
- ECS
- CloudWatch
