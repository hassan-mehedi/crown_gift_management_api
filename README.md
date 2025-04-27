# Crown Gift Management API

This is a RESTful API for managing gifts built with Node.js, Express, MongoDB, TypeScript, and Zod validation.

## Features

-   CRUD operations for gifts, stock items, and receivers
-   User authentication using JWT
-   Data validation using Zod
-   TypeScript for type safety
-   MongoDB with Mongoose for data storage

## Requirements

-   Node.js 16+
-   MongoDB

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crown_gift_management
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### User Routes

-   `POST /api/users/register` - Register a new user
-   `POST /api/users/login` - Login and get token

### Stock Item Routes

-   `GET /api/stock-items` - Get all stock items with pagination
-   `GET /api/stock-items/:id` - Get a single stock item by ID
-   `POST /api/stock-items` - Create a new stock item (protected)
-   `PATCH /api/stock-items/:id` - Update a stock item (protected)
-   `DELETE /api/stock-items/:id` - Delete a stock item (protected)

### Receiver Routes

-   `GET /api/receivers` - Get all receivers with pagination
-   `GET /api/receivers/:id` - Get a single receiver by ID
-   `POST /api/receivers` - Create a new receiver (protected)
-   `PATCH /api/receivers/:id` - Update a receiver (protected)
-   `DELETE /api/receivers/:id` - Delete a receiver (protected)

### Gift Routes

-   `GET /api/gifts` - Get all gifts with pagination
-   `GET /api/gifts/:id` - Get a single gift by ID
-   `GET /api/gifts/receiver/:receiverId` - Get gifts by receiver ID
-   `GET /api/gifts/stockItem/:stockItemId` - Get gifts by stock item ID
-   `POST /api/gifts` - Create a new gift (protected)
-   `PATCH /api/gifts/:id` - Update a gift (protected)
-   `DELETE /api/gifts/:id` - Delete a gift (protected)

## Protected Routes

For protected routes, include a valid JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## Data Models

### Stock Item

```json
{
    "name": "Gift Item Name",
    "quantity": 10,
    "storage": "Storage Location",
    "totalCost": 500,
    "picture": "image_url.jpg",
    "date": "2023-01-01T00:00:00.000Z"
}
```

### Receiver

```json
{
    "name": "Receiver Name",
    "phone": "1234567890",
    "email": "receiver@example.com",
    "department": "Department Name"
}
```

### Gift

```json
{
    "stockItemId": "stock_item_id_here",
    "quantity": 1,
    "receiverId": "receiver_id_here",
    "date": "2023-01-01T00:00:00.000Z"
}
```
