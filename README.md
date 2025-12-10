# News Management System

A RESTful backend application for managing news articles and categories, built with NestJS, MySQL, and Redis caching.

> **🔴 Live Demo:** [https://news-management-system-zomp.onrender.com/](https://news-management-system-zomp.onrender.com/)
>
> *Note: The live server is hosted on a free instance and may take a few minutes to wake up from inactivity.*

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Design](#database-design)
- [Redis Caching Strategy](#redis-caching-strategy)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Docker Deployment](#docker-deployment)

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Validation**: Zod (via nestjs-zod)
- **Containerization**: Docker & Docker Compose

## ✨ Features

- ✅ **CRUD Operations** for categories and news articles
- ✅ **Soft Delete** support for news (data retained with `deleted_at` timestamp)
- ✅ **Pagination** for news list API
- ✅ **Redis Caching** with automatic invalidation
- ✅ **Input Validation** using Zod schemas
- ✅ **Type Safety** with TypeScript
- ✅ **RESTful API** design
- ✅ **Docker** support for easy deployment

## 🗄️ Database Design

### Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│    category     │         │      news        │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │◄────────│ id (PK)          │
│ categoryName    │    1:N  │ title            │
│ created_at      │         │ description      │
│ updated_at      │         │ category_id (FK) │
└─────────────────┘         │ created_at       │
                            │ updated_at       │
                            │ deleted_at       │
                            └──────────────────┘
```

### Tables

#### `category`
| Column       | Type         | Description                    |
|--------------|--------------|--------------------------------|
| id           | VARCHAR(36)  | Primary key (UUID)             |
| categoryName | VARCHAR(100) | Unique category name           |
| created_at   | DATETIME     | Timestamp of creation          |
| updated_at   | DATETIME     | Timestamp of last update       |

#### `news`
| Column       | Type         | Description                    |
|--------------|--------------|--------------------------------|
| id           | VARCHAR(36)  | Primary key (UUID)             |
| title        | VARCHAR(200) | News title                     |
| description  | TEXT         | News content                   |
| category_id  | VARCHAR(36)  | Foreign key to category        |
| created_at   | DATETIME     | Timestamp of creation          |
| updated_at   | DATETIME     | Timestamp of last update       |
| deleted_at   | DATETIME     | Soft delete timestamp (NULL if active) |

**Relationships:**
- News **belongs to** one Category (Many-to-One)
- Category **has many** News articles (One-to-Many)
- Cascade delete: Deleting a category removes all associated news

**Indexes:**
- `idx_category_name` on `category.categoryName`
- `idx_news_category` on `news.category_id`
- `idx_news_created` on `news.created_at`
- `idx_news_deleted` on `news.deleted_at`

## 🔄 Redis Caching Strategy

### Cache Keys

| Endpoint          | Cache Key      | TTL      | Strategy              |
|-------------------|----------------|----------|-----------------------|
| GET /news         | `all_news`     | 600s     | Automatic (decorator) |
| GET /news/:id     | `news:{id}`    | 300s     | Manual check          |
| GET /category     | `all_categories` | 600s   | Automatic (decorator) |
| GET /category/:id | `category:{id}` | 300s    | Manual check          |

### Cache Invalidation

Caches are automatically cleared when:
- **Creating** news/category → Clear list cache
- **Updating** news/category → Clear both list and item caches
- **Deleting** news/category → Clear both list and item caches

### Implementation

```typescript
// Automatic caching via decorator
@CacheKey('all_news')
@Get()
async findAll() { ... }

// Manual caching for individual items
const cached = await this.cacheManager.get(key);
if (cached) return cached;

// Cache with 5-minute TTL
await this.cacheManager.set(key, data, 300);

// Cache invalidation
await this.cacheManager.del(['all_news', 'news:123']);
```

## 📦 Setup Instructions

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0
- Redis 7
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd news-management-system
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

4. **Create database**
   ```bash
   mysql -u root -p
   CREATE DATABASE news_management;
   USE news_management;
   SOURCE database/schema.sql;
   ```

5. **Start Redis**
   ```bash
   redis-server
   ```

6. **Run the application**
   ```bash
   # Development mode
   yarn start:dev

   # Production mode
   yarn build
   yarn start:prod
   ```

7. **Application runs on**
   ```
   http://localhost:5000
   ```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - MySQL database on port 3306
   - Redis cache on port 6379
   - Node.js app on port 5000

2. **Run Migrations (Important)**
   After the container is running, you need to execute the database migrations manually:

   ```bash
   # Enter the app container
   docker exec -it news-management-app bash

   # Run migrations inside the container
   yarn migration:run
   ```

3. **View logs**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes**
   ```bash
   docker-compose down -v
   ```

### Manual Docker Build

```bash
# Build image
docker build -t news-management-app .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_HOST=mysql \
  -e REDIS_HOST=redis \
  news-management-app
```

## 📡 API Endpoints

### Category Endpoints

#### Create Category
```http
POST /category
Content-Type: application/json

{
  "categoryName": "Technology"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "payload": {
    "category": {
      "id": "uuid",
      "categoryName": "Technology",
      "createdAt": "2025-12-10T00:00:00.000Z",
      "updatedAt": "2025-12-10T00:00:00.000Z"
    }
  }
}
```

#### List All Categories
```http
GET /category
```

**Response:** `200 OK` (Cached with key `all_categories`)

#### Get Single Category
```http
GET /category/:id
```

**Response:** `200 OK` (Cached for 5 minutes)
```json
{
  "statusCode": 200,
  "payload": {
    "category": { ... },
    "fromCache": true
  }
}
```

#### Update Category
```http
PATCH /category/:id
Content-Type: application/json

{
  "categoryName": "Updated Name"
}
```

**Response:** `200 OK`

#### Delete Category
```http
DELETE /category/:id
```

**Response:** `200 OK`

---

### News Endpoints

#### Create News
```http
POST /news
Content-Type: application/json

{
  "title": "Breaking News Title",
  "description": "Full news article content here...",
  "categoryId": "category-uuid"
}
```

**Response:** `201 Created`

#### List News with Pagination
```http
GET /news?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number, default `1`
- `limit` (optional): Items per page, default `10`, max `100`

**Response:** `200 OK` (Cached with key `all_news`)
```json
{
  "statusCode": 200,
  "payload": {
    "news": [
      {
        "id": "uuid",
        "title": "News Title",
        "description": "News content...",
        "category": {
          "id": "uuid",
          "categoryName": "Technology"
        },
        "createdAt": "2025-12-10T00:00:00.000Z",
        "updatedAt": "2025-12-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### Get Deleted News
Retrieves the list of soft-deleted news articles.
```http
GET /news/deleted
```

**Response:** `200 OK`

#### Get Single News
```http
GET /news/:id
```

**Response:** `200 OK` (Cached for 5 minutes)

#### Update News
```http
PATCH /news/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated content..."
}
```

**Response:** `200 OK`

#### Delete News (Soft Delete)
```http
DELETE /news/:id
```

**Response:** `200 OK`

**Note:** News is soft-deleted (sets `deleted_at` timestamp) and won't appear in standard queries.

#### Restore Deleted News
Restores a soft-deleted news article.
```http
POST /news/restore/:id
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "payload": {
    "message": "News restored successfully"
  }
}
```

---

## 🔧 Environment Variables

See `.env.example` for all required variables:

```env
NODE_ENV=development
PORT=5000

DATABASE_USERNAME=your_mysql_username
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=news_management
DATABASE_HOST=localhost
DATABASE_PORT=3306

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=600
```

## 📝 Project Structure

```
news-management-system/
├── src/
│   ├── modules/
│   │   ├── category/
│   │   │   ├── dto/
│   │   │   ├── schema/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.module.ts
│   │   └── news/
│   │       ├── dto/
│   │       ├── schema/
│   │       ├── news.controller.ts
│   │       ├── news.service.ts
│   │       └── news.module.ts
│   ├── entities/
│   │   ├── category.entity.ts
│   │   └── news.entity.ts
│   ├── common/
│   │   ├── dto/
│   │   └── apiResponse/
│   ├── config/
│   └── app.module.ts
├── database/
│   └── schema.sql
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🎯 Key Design Decisions

### DRY Principles Applied

1. **Base Cache Helper Methods**: Shared cache invalidation logic
2. **Pagination DTO**: Reusable across modules
3. **API Response Wrapper**: Consistent response structure
4. **Zod Schemas**: Centralized validation logic

### Soft Delete Approach

- Uses TypeORM's `@DeleteDateColumn` decorator
- Automatically filters soft-deleted records in queries
- Data retained for audit/recovery purposes
- `softRemove()` method sets `deleted_at` timestamp

### Caching Strategy

- **List endpoints**: Cached automatically using `@CacheKey` decorator
- **Single item endpoints**: Manual cache check with `fromCache` flag in response
- **Mutations**: Invalidate affected caches immediately
- **TTL**: List (10 min), Items (5 min) - configurable via Redis TTL

## 📄 License

MIT

## 👤 Author

SOUROV SARKAR

---

**Happy Coding! 🚀**
