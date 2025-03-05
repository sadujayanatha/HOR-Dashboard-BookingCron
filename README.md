# Beds24 Sync Service

A NestJS microservice that synchronizes booking data from Beds24 API to a PostgreSQL database.

## Features

- Initial full sync of all historical booking data (paginated in 500 record chunks)
- Hourly incremental sync of newly changed bookings
- Bull queue with Redis for reliable job processing
- Detailed sync logs tracking performance and errors
- Transaction-based database operations for data consistency

## Prerequisites

- Node.js 18+ (with pnpm)
- PostgreSQL database
- Redis server
- Beds24 API key

## Setup and Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/beds24-sync-service.git
cd beds24-sync-service
```

2. Install dependencies

```bash
pnpm install
```

3. Create a `.env` file with your credentials

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/beds24_database?schema=public"
BEDS24_API_KEY="your_beds24_api_key"
BEDS24_API_URL="https://api.beds24.com/json"
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

4. Generate Prisma client

```bash
pnpm dlx prisma generate
```

5. Run migrations

```bash
pnpm dlx prisma migrate dev --name init
```

## Running the Service

### Development Mode

```bash
pnpm run start:dev
```

### Production Mode

```bash
pnpm run build
pnpm run start:prod
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Sync Process

1. **Initial Sync**: 
   - When the service starts with an empty database, it performs a full historical sync
   - First syncs all property data
   - Then fetches all bookings for each property in paginated batches of 500
   - Processes all bookings, creating booking_day records for revenue analysis

2. **Incremental Sync**:
   - Runs every hour via a scheduled cron job
   - Only fetches bookings that have been changed since the last sync
   - Updates properties and rooms data as well

## Database Schema

The service uses a simplified version of your database schema, focusing only on:

- Properties
- Rooms
- Bookings
- BookingDays
- SyncLogs

## Monitoring

Check the sync_logs table to monitor sync operations:

```sql
SELECT * FROM sync_logs ORDER BY start_timestamp DESC LIMIT 10;
```

## Customization

- Adjust sync frequency in `beds24-sync.service.ts` by changing the cron expression
- Modify page size for initial sync by changing the `pageSize` property
- Add additional fields to sync by updating the models and property/booking mappers