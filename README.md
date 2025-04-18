# Cafe Management System - Microservices Architecture

This project implements a cafe management system using a microservices architecture. The system consists of the following services:

1. **Main Service** (Port 3000) - Entry point for customers
2. **Order Service** (Port 3001) - Handles order creation and management
3. **Menu Service** (Port 3002) - Manages menu items and categories
4. **Inventory Service** (Port 3003) - Tracks inventory and stock levels
5. **Customer Service** (Port 3004) - Manages customer profiles and loyalty points

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB Atlas account (for database)

## Running with Docker Compose

The easiest way to run all services is using Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Running Locally (Development)

If you prefer to run the services locally for development:

1. Install dependencies for each service:
```bash
# Main service
npm install

# Order service
cd Order_service && npm install

# Menu service
cd Menu_service && npm install

# Inventory service
cd Inventory_service && npm install

# Customer service
cd Customer_service && npm install
```

2. Start each service in a separate terminal:
```bash
# Main service
npm start

# Order service
cd Order_service && npm start

# Menu service
cd Menu_service && npm start

# Inventory service
cd Inventory_service && npm start

# Customer service
cd Customer_service && npm start
```

## API Endpoints

### Main Service (Port 3000)

- `GET /api/menu` - Get all menu items
- `GET /api/menu/category/:category` - Get menu items by category
- `POST /api/orders` - Create a new order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/inventory` - Get inventory status
- `GET /api/customers` - Get all customers
- `GET /api/customers/:customerId` - Get customer details
- `GET /api/customers/:customerId/points` - Get customer loyalty points
- `GET /api/customers/:customerId/orders` - Get customer order history
- `GET /api/customers/:customerId/summary` - Get customer spending summary

### Order Service (Port 3001)

- `POST /api/orders` - Create a new order
- `GET /api/orders/:orderId` - Get order details

### Menu Service (Port 3002)

- `GET /api/menu` - Get all menu items
- `GET /api/menu/:itemId` - Get menu item by ID
- `GET /api/menu/category/:category` - Get menu items by category
- `POST /api/menu` - Add new menu item

### Inventory Service (Port 3003)

- `POST /api/inventory/update` - Update inventory based on order
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:itemId` - Get inventory item by ID
- `POST /api/inventory` - Add new inventory item

### Customer Service (Port 3004)

- `POST /api/customers` - Create a new customer
- `GET /api/customers` - Get all customers
- `GET /api/customers/:customerId` - Get customer by ID
- `GET /api/customers/email/:email` - Get customer by email
- `GET /api/customers/:customerId/points` - Get customer loyalty points
- `GET /api/customers/:customerId/orders` - Get customer order history
- `GET /api/customers/:customerId/summary` - Get customer spending summary
- `PUT /api/customers/:customerId` - Update customer information
- `POST /api/customers/:customerId/points` - Update customer points

## CI/CD Pipeline

The project includes a GitHub Actions workflow for continuous integration and deployment:

1. **Build and Test** - Installs dependencies and runs tests
2. **Docker Build** - Builds and pushes Docker images to DockerHub
3. **Deploy** - Deploys the application to production

To use the CI/CD pipeline, you need to set up the following secrets in your GitHub repository:

- `DOCKERHUB_USERNAME` - Your DockerHub username
- `DOCKERHUB_TOKEN` - Your DockerHub access token

## Environment Variables

The services use the following environment variables:

- `MONGODB_URI` - MongoDB connection string
- `ORDER_SERVICE_URL` - URL of the order service
- `MENU_SERVICE_URL` - URL of the menu service
- `INVENTORY_SERVICE_URL` - URL of the inventory service
- `CUSTOMER_SERVICE_URL` - URL of the customer service

These variables are set in the docker-compose.yml file for containerized deployment. 