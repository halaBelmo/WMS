# Warehouse Management System (WMS)

A web-based warehouse management system for organizing warehouse structure, products, stock, and stock movements. The application consists of a React frontend, a Spring Boot API, and optional Kafka, HDFS, and Hive services for data processing and analytics.

## Features

- Account registration and login with JWT-based authentication
- Role-aware access for owners (`OWNER`), administrators (`ADMIN`), and warehouse staff (`MAGASINIER`)
- Dashboard and warehouse overview
- Warehouse and location structure management, including zones, racks, shelves, and locations
- Product, supplier, customer, user, and stock management
- Stock movement workflows
- Analytics views
- Kafka event pipeline with optional HDFS storage and Hive access

Available screens and actions depend on the signed-in user's role.

## Technology

- **Frontend:** React 18, React Router, Vite, Axios, and Recharts
- **Backend:** Java 17, Spring Boot, Spring Security, Spring Data JPA, and Maven
- **Database:** PostgreSQL
- **Data services:** Kafka, Kafka Connect, Hadoop HDFS, and Hive (provided through Docker Compose)

## Prerequisites

- Node.js and npm
- Java 17 JDK
- Docker Compose, if using the Kafka/HDFS/Hive services
- PostgreSQL for application data

## Getting Started

### 1. Configure PostgreSQL

Create a PostgreSQL database and user, then update `backend/src/main/resources/application.properties` to match your local setup. The current configuration expects PostgreSQL at `localhost:5432` and a database named `WMS`.

Before running the application, replace the checked-in development database credentials and JWT signing secret with values appropriate for your environment. Do not use development secrets in a deployed environment.

### 2. Start the supporting data services (optional)

The Compose stack provides ZooKeeper, Kafka, Kafka Connect, HDFS, and Hive. It does **not** provide the PostgreSQL database used by the application.

From the repository root, start the services with:

```bash
docker compose up -d
```

The backend is configured to connect to Kafka at `localhost:9092` and Hive at `localhost:10000`. Start the services when using features that depend on them.

To stop the services:

```bash
docker compose down
```

### 3. Run the backend

In a terminal:

```bash
cd backend
./mvnw spring-boot:run
```

The API listens on `http://localhost:8080` by default. Run the backend tests with:

```bash
./mvnw test
```

### 4. Run the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). The frontend sends API requests to `http://localhost:8080` by default. To use a different API URL, set `VITE_API_BASE_URL` before starting Vite.

Build the frontend for production with:

```bash
npm run build
```

## Project Structure

```text
.
├── backend/                  # Spring Boot API and Maven wrapper
├── frontend/                 # React application and Vite configuration
├── docker-compose.yml        # Kafka, HDFS, Hive, and supporting services
└── hdfs-sink.json            # Kafka Connect HDFS sink configuration
```

## Data Pipeline

`hdfs-sink.json` defines a Kafka Connect HDFS sink for the `stock-movements` topic. It writes JSON events under `/warehouse/wms/kafka-events` in HDFS. The connector configuration is separate from starting the Docker Compose services; Kafka Connect must be running and the connector must be registered with its REST API before events are written to HDFS.

## Development Notes

- The backend uses port `8080`; the frontend development server typically uses port `5173`.
- Database schema updates are enabled by the backend's current Hibernate configuration. Review this setting before deploying.
- Keep credentials and signing keys out of source control when configuring a real environment.