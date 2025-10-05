# 🚀 NestJS Backend Starter Template

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Starter template for building backend applications with NestJS that comes with ready-to-use Authentication, Authorization, Caching, and Database Migration.
</p>

## ✨ Features

### Core Features

- ⚡ **Fastify** - HTTP server that is twice as fast as Express
- 🗄️ **TypeORM** - TypeScript-first ORM with connection pooling
- 🗃️ **Multi-Database Support** - Full support for MySQL and PostgreSQL
- 🔐 **JWT Authentication** - Secure authentication system
- 🛡️ **Dynamic RBAC System** - Dynamic role-based access control management
- 🎯 **Permission Management** - Granular permission management
- 🚀 **Redis Caching** - Multi-layer caching with HTTP cache interceptors
- 🔄 **Database Migration** - Structured schema management
- 🌱 **Database Seeding** - Automatically seed initial data
- 📝 **Scalar Documentation** - Modern interactive API docs
- ✅ **Input Validation** - Validate data with class-validator
- 🔒 **Security Headers** - Protect against common vulnerabilities
- 📤 **File Upload** - Multipart file upload system
- 📦 **Docker Support** - Ready-to-use Docker Compose for development
- 📝 **Advanced Logger** - Winston-based logging with daily rotation and multiple log levels
- 💾 **Automated Backups** - Scheduled database and files backup with retention management
- 🏥 **Health Checks** - Comprehensive system health monitoring endpoints

### Advanced Security Features

- 🔐 **Role Priority System** - Prevent lower-privilege users from modifying higher-privilege accounts
- 📧 **Multi-Channel Notifications** - Email, Telegram, Discord, and LINE Messaging API support
- 📝 **Notification Templates** - Flexible template system for notifications with variable substitution
- 🔑 **Two-Factor Authentication (2FA)** - Optional TOTP-based 2FA with QR code generation
- 🎫 **Session Management** - Track and manage user sessions with device information
- 🌐 **IP Whitelisting** - Restrict access based on IP addresses with CIDR support
- 🔔 **Security Event Notifications** - Real-time alerts for security-critical events
- 📊 **Session Analytics** - Monitor active sessions and device usage

### Performance Optimizations

- ⚡ **Cluster Mode** - Multi-process support for better CPU utilization
- 🎯 **Connection Pooling** - Optimized database connection management
- 💾 **Query Result Caching** - Redis-based query cache (30s default)
- 🗜️ **Brotli Compression** - Superior compression with Brotli + Gzip fallback
- 📄 **Pagination System** - Built-in pagination with search & sort
- 🔍 **Query Builder Utilities** - Optimized query building helpers
- ⚙️ **Slow Query Logging** - Automatic detection of slow queries (>1s)
- 🚀 **Static Asset Caching** - Cache headers for static files
- 📊 **Performance Monitoring** - Built-in performance tracking

### Logging & Monitoring

- 📝 **Winston Logger** - Professional logging system with daily rotation
- 📊 **Multiple Log Levels** - Support for error, warn, info, debug, and verbose logs
- 🗂️ **Log File Rotation** - Automatic daily rotation with configurable retention
- 🗜️ **Log Compression** - Automatic compression of old log files
- 🔍 **Structured Logging** - JSON-formatted logs with context and metadata
- 🚀 **Request/Response Logging** - Automatic HTTP request and response logging
- ⏱️ **Slow Request Detection** - Automatic detection and logging of slow requests
- 🔐 **Security Event Logging** - Track authentication and authorization events
- 💾 **Database Query Logging** - Log all database queries with execution time

### Backup & Recovery

- 💾 **Automated Database Backup** - Scheduled MySQL database backups with mysqldump
- 📁 **Files Backup** - Backup important directories (uploads, logs, etc.)
- ⏰ **Cron-based Scheduling** - Flexible backup scheduling with cron expressions
- 🗜️ **Backup Compression** - Automatic gzip compression to save storage space
- 🔄 **Retention Management** - Automatic cleanup of old backups based on retention policy
- ✅ **Backup Verification** - Verify backup integrity with size and content checks
- 📊 **Backup Statistics** - Track backup history and storage usage
- 🔔 **Backup Notifications** - Get notified on backup success or failure
- 🔧 **Manual Backup** - Create backups on-demand via API endpoints
- ♻️ **Database Restore** - Restore database from backup files
- 🗑️ **Backup Management** - List, view, and delete backup files via API

### Health Monitoring

- 🏥 **Health Check Endpoints** - Monitor system health status
- 💾 **Database Health** - Check database connectivity and response time
- 🧠 **Memory Monitoring** - Track heap and RSS memory usage
- 💿 **Disk Space Monitoring** - Monitor available disk space
- 📝 **Log System Health** - Verify log directory accessibility and disk usage
- 💾 **Backup System Health** - Monitor backup status and recent backup age
- 📊 **Detailed Health Reports** - Get comprehensive health status with metrics

## 📋 Prerequisites

- **Bun >= 1.0** (Recommended) or Node.js >= 18.x
- **Database** (Choose one):
  - MySQL >= 8.x
  - PostgreSQL >= 13.x
- Redis >= 7.x
- Docker & Docker Compose (Optional)

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd nestjs-starter
```

### 2. Install Dependencies

**With Bun (Recommended):**

```bash
bun install
```

**Or with npm:**

```bash
npm install
```

### 3. Environment Configuration

Create the `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update the configuration values in `.env` as needed:

```env
# Application
NODE_ENV=development
PORT=3000
TIMEZONE=Asia/Bangkok
API_PREFIX=api/v1

# Cluster Mode
CLUSTER_ENABLED=true
CLUSTER_WORKERS=0

# Database Configuration
# Supported types: mysql, mariadb, postgres, postgresql

# Option 1: Use DB_URL (recommended for PostgreSQL)
# DB_URL=postgresql://username:password@localhost:5432/database_name
# DB_URL=mysql://username:password@localhost:3306/database_name

# Option 2: Use individual connection parameters
# MySQL/MariaDB (Default Port: 3306)
# PostgreSQL (Default Port: 5432)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=nestjs_starter

# Database Synchronize & Logging
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Redis
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_RATE_LIMIT_DB=2

# Performance
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
CACHE_TTL=60
QUERY_CACHE_DURATION=30000
COMPRESSION_THRESHOLD=1024
BROTLI_QUALITY=4
GZIP_LEVEL=6
CONNECTION_TIMEOUT=30000
KEEP_ALIVE_TIMEOUT=72000
BODY_LIMIT=10485760
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
LOG_SLOW_QUERIES=true
SLOW_QUERY_THRESHOLD=1000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Upload
BASE_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
# ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf

# Notifications
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@example.com
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
DISCORD_WEBHOOK_URL=your-discord-webhook-url
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
LINE_CHANNEL_SECRET=your-line-channel-secret

# Logger
LOG_LEVEL=info
LOG_DIR=./logs
LOG_MAX_FILES=30d
LOG_MAX_SIZE=20m
LOG_DATE_PATTERN=YYYY-MM-DD
LOG_COMPRESS=true
LOG_CONSOLE_ENABLED=true
LOG_FILE_ENABLED=true
LOG_ERROR_FILE=error-%DATE%.log
LOG_COMBINED_FILE=combined-%DATE%.log
LOG_REQUEST_ENABLED=true
LOG_RESPONSE_ENABLED=true
LOG_SLOW_REQUEST_THRESHOLD=3000

# Backup
BACKUP_ENABLED=true
BACKUP_DIR=./backups

# Tools Path
MYSQL_BIN_PATH=
POSTGRES_BIN_PATH=

# Database Backup
BACKUP_DATABASE_ENABLED=true
BACKUP_DATABASE_SCHEDULE=0 2 * * *
BACKUP_DATABASE_RETENTION_DAYS=30
BACKUP_DATABASE_COMPRESS=true

# Files Backup
BACKUP_FILES_ENABLED=true
BACKUP_FILES_SCHEDULE=0 3 * * *
BACKUP_FILES_RETENTION_DAYS=14
BACKUP_FILES_COMPRESS=true
BACKUP_FILES_DIRECTORIES=./uploads,./logs

# Backup Verification
BACKUP_VERIFICATION_ENABLED=true
BACKUP_VERIFICATION_CHECK_SIZE=true
BACKUP_VERIFICATION_MIN_SIZE_BYTES=1024

# Backup Notifications
BACKUP_NOTIFICATIONS_ENABLED=true
BACKUP_NOTIFICATIONS_ON_SUCCESS=false
BACKUP_NOTIFICATIONS_ON_FAILURE=true

# Scalar Documentation
SCALAR_ENABLED=true
SCALAR_TITLE=NestJS Backend API
SCALAR_DESCRIPTION=API Documentation for NestJS Backend Starter Template
SCALAR_VERSION=1.0
SCALAR_PATH=api/docs
```

### 4. Start Services with Docker (Recommended)

```bash
docker-compose up -d
```

Or install MySQL and Redis separately.

### 5. Run Database Migrations

**With Bun:**

```bash
bun run migration:run
```

**Or with npm:**

```bash
npm run migration:run
```

### 6. Seed Default Data

**With Bun:**

```bash
bun run seed
```

**Or with npm:**

```bash
npm run seed
```

## 🚀 Running the Application

### Development Mode

**With Bun:**

```bash
bun run start:dev
```

**Or with npm:**

```bash
npm run start:dev
```

### Production Mode

**With Bun:**

```bash
bun run build
bun run start:prod
```

**Or with npm:**

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 📚 API Documentation

After running the application, access the Scalar Documentation at:

```
http://localhost:3000/api/docs
```

Scalar provides a modern, beautiful, and interactive API documentation interface with features like:

- 🎨 Modern and clean UI with dark mode support
- 🚀 Fast and responsive
- 🔍 Advanced search capabilities
- 📱 Mobile-friendly design
- 🎯 Better request/response examples

## 🗄️ Database Migrations

### Create A New Migration

```bash
npm run migration:create -- src/database/migrations/migration_name
```

### Generate Migration From Entity

```bash
npm run migration:generate -- src/database/migrations/migration_name
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Migration

```bash
npm run migration:revert
```

### Fresh Database

```bash
npm run migration:fresh
```

### Fresh Database With Seed

```bash
npm run migration:fresh:seed
```

## 📚 Database Schema

### Schema Sync

```bash
npm run schema:sync
```

### Drop Schema

```bash
npm run schema:drop
```

## 🛡️ Security Features

### Authentication & Authorization

- **JWT Authentication** - Authenticate users with JSON Web Token
- **Role Priority System** - Hierarchical role-based access control (Super Admin > Admin > User > Guest)
- **Two-Factor Authentication (2FA)** - Optional TOTP-based authentication with QR code
- **Session Management** - Track active sessions with device and IP information
- **IP Whitelisting** - Restrict access to specific IP addresses or CIDR ranges

### Security Hardening

- **Password Hashing** - Encrypt passwords with bcrypt (configurable salt rounds)
- **Helmet** - Secure the app with essential security headers
- **Rate Limiting** - Control the number of requests per time window
- **CORS** - Define cross-origin access permissions
- **Input Validation** - Validate and sanitize input data
- **File Upload Validation** - Validate file size and MIME types
- **Global Exception Filter** - Handle errors safely and consistently

### Monitoring & Notifications

- **Multi-Channel Notifications** - Send alerts via Email, Telegram, Discord, and LINE Messaging API
- **Notification Templates** - Create and manage reusable notification templates with variables
- **Template Categories** - Organize templates by category (Security, System, User, Marketing, Transaction)
- **Variable Substitution** - Dynamic content replacement in notification templates
- **Security Event Tracking** - Monitor and log security-critical events
- **Session Analytics** - Track user sessions and detect anomalies
- **IP History Tracking** - Log and monitor IP address changes

## 🔔 Notification

Flexible notification template system with variable substitution.

### Core Features

- Create and manage notification templates
- Support multiple channels (Email, Telegram, Discord, LINE Messaging API)
- Variable substitution with `{{variable_name}}`
- Template categorization (Security, System, User, Marketing, Transaction)
- Define default values for variables
- Preview template before sending

## 📝 Logging System

Advanced logging system built on Winston with daily rotation and multiple log levels.

### Features

- **Multiple Log Levels** - error, warn, info, debug, verbose
- **Daily Rotation** - Automatic log file rotation based on date
- **Log Compression** - Compress old log files to save space
- **Structured Logging** - JSON-formatted logs with context and metadata
- **Console & File Output** - Log to both console and files
- **Context Support** - Add context to log messages for better tracking
- **HTTP Logging** - Automatic request/response logging with response time
- **Slow Request Detection** - Detect and log requests that exceed threshold
- **Database Query Logging** - Log all queries with execution time
- **Authentication Logging** - Track login attempts and security events

## 💾 Backup System

Automated backup system with scheduling, compression, and retention management.

### Features

- **Database Backup** - MySQL database backup using mysqldump
- **Files Backup** - Backup important directories (uploads, logs, etc.)
- **Scheduled Backups** - Cron-based automatic backups
- **Compression** - Gzip compression to save storage
- **Retention Policy** - Automatic cleanup of old backups
- **Backup Verification** - Verify backup integrity
- **Notifications** - Get notified on backup events
- **Manual Backup** - Create backups via API endpoints
- **Restore Database** - Restore from backup files
- **Backup Management** - List, view stats, and delete backups

## 🏥 Health Check System

Comprehensive health monitoring system to check system status and availability.

### Features

- **Database Health** - Check database connectivity
- **Memory Health** - Monitor heap and RSS memory usage
- **Disk Health** - Monitor disk space availability
- **Backup Health** - Check backup system status and recent backups
- **Log Health** - Verify log system functionality
- **Individual Checks** - Check specific components separately
- **Detailed Reports** - Get comprehensive health metrics

### Health Check Thresholds

- **Memory Heap**: 300 MB
- **Memory RSS**: 500 MB
- **Disk Space**: 90% usage
- **Backup Age**: 48 hours since last backup
- **Log Directory**: Must be accessible and writable

### Integration with Monitoring Tools

Health check endpoints can be integrated with monitoring tools like:

- **Uptime Kuma** - Self-hosted monitoring tool
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **Datadog** - Cloud monitoring service
- **New Relic** - Application performance monitoring

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

## 📝 Author

**Made with ❤️ by @jirateep12z**
