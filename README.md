# WaterFlow

**Water Delivery & Refill Management System**
## Project Overview

**WaterFlow** is a full-stack web application designed to simplify the process of ordering, paying for, and delivering water.

The system allows customers to browse available water products, add products to a shopping cart, place delivery orders, make payments through `M-Pesa`, manage delivery locations, track orders, and subscribe to recurring water deliveries.

Management can manage customers, products, inventory, containers, drivers, orders, payments, deliveries, and subscriptions through a centralized management system.

Drivers can log in, view assigned deliveries, access customer delivery locations using Google Maps, and update delivery statuses.

The project is designed to replace manual water delivery processes with a centralized, efficient, and user-friendly digital platform.
## Problems It Solves

- Replaces manual orders with a centralized ordering system.
- Simplifies payment tracking through `M-Pesa`.
- Improves inventory and reusable container tracking.
- Helps management assign and monitor deliveries.
- Supports recurring customer orders through subscriptions.
- Gives customers better order and delivery tracking.
## Core Features

### Customer
- Register/login with `JWT`
- Browse products and manage cart
- Place orders and pay through `M-Pesa`
- Manage addresses and track orders
- Create, pause, resume, and cancel subscriptions

### Management
- Dashboard and basic reports
- Manage customers, products, categories, orders, payments, inventory, containers, drivers, deliveries, and subscriptions
- Monitor stock and low-stock alerts

### Driver
- Login and view assigned deliveries
- View customer/location details
- Open locations with `Google Maps`
- Update delivery status and delivery history
## User Roles

| Role | Main Responsibilities |
|---|---|
| `Customer` | Products, cart, orders, payments, addresses, tracking, subscriptions |
| `Management` | Customers, products, orders, inventory, containers, drivers, deliveries, payments, subscriptions |
| `Driver` | Assigned deliveries, customer locations, delivery status updates |
## Core Functionalities

1. `Authentication & User Management`
2. `Product Management`
3. `Customer Management`
4. `Shopping Cart & Ordering`
5. `M-Pesa Payment Integration`
6. `Address & Location Management`
7. `Inventory Management`
8. `Container & Refill Management`
9. `Driver & Delivery Management`
10. `Subscription Management`
11. `Notifications`
12. `Dashboard & Basic Reporting`
## Order Workflow

`Customer → Products → Cart → Checkout → Address → `M-Pesa` → Verification → Processing → Driver Assignment → Delivery → Completed`
## Subscription Workflow

`Product + Quantity + Frequency + Address → Subscription → Recurring Order → Payment → Delivery → Next Scheduled Delivery`
## `M-Pesa` Payment Workflow

WaterFlow will use the `Safaricom M-Pesa Daraja API` for payment processing.

```text
Customer
   ↓
Places Order
   ↓
Checkout
   ↓
Initiates M-Pesa Payment
   ↓
Django Backend
   ↓
M-Pesa Daraja API
   ↓
Customer Completes Payment
   ↓
Daraja Callback
   ↓
Django Verifies Payment
   ↓
Payment Recorded
   ↓
Order Marked as Paid

```

The React frontend will not communicate directly with the `M-Pesa` Daraja API.

The Django backend will securely handle `M-Pesa` credentials, payment requests, callbacks, and payment records.
## Delivery Workflow

`Paid Order → Processing → Driver Assigned → Driver Navigation → Out for Delivery → Delivered → Completed`
## Order Statuses

`Pending Payment` → `Paid` → `Processing` → `Assigned` → `Out for Delivery` → `Delivered` / `Cancelled`
## Delivery Statuses

`Pending` → `Assigned` → `Out for Delivery` → `Delivered` / `Failed`
## Inventory Management

Management can view stock, add/reduce stock, record transactions, and monitor low-stock products. The system must prevent stock from becoming negative.
## Container Management

Tracks reusable containers and their movement.

Statuses: `Available`, `With Customer`, `In Transit`, `Returned`, `Damaged`.
## Notifications

In-system notifications for orders, payments, deliveries, subscriptions, and low-stock alerts.
## Google Maps Integration

Customers provide delivery locations and drivers open them using `Google Maps`. The MVP does not include live GPS tracking or advanced route optimization.
## Project Structure

```text
WaterFlow/
├── backend/
│   ├── manage.py
│   ├── config/
│   └── apps/
│       ├── accounts/
│       ├── customers/
│       ├── products/
│       ├── cart/
│       ├── orders/
│       ├── payments/
│       ├── inventory/
│       ├── containers/
│       ├── drivers/
│       ├── deliveries/
│       ├── subscriptions/
│       └── notifications/
├── frontend/
│   └── src/
├── .gitignore
└── README.md
```
## Proposed Database Models

`User`, `CustomerProfile`, `Driver`, `ProductCategory`, `Product`, `Address`, `DeliveryZone`, `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `Inventory`, `InventoryTransaction`, `Container`, `ContainerTransaction`, `Delivery`, `Payment`, `Subscription`, `SubscriptionItem`, `Notification`.
## Technologies Used

- Frontend: `React.js`, `JavaScript`, `HTML5`, `CSS3`
- Backend: `Python 3`, `Django`, `Django REST Framework`, `JWT`
- Database: `PostgreSQL`
- Integrations: `M-Pesa Daraja API`, `Google Maps API`
- Tools: `VS Code`, `Git`, `GitHub`, `Postman`, `Swagger/OpenAPI`
- Deployment: `Render`
## Core Django Concepts Demonstrated

`Django models`, `migrations`, `Django REST Framework`, `serializers`, `API views`, `authentication`, `permissions`, `CRUD`, `PostgreSQL`, database relationships, environment variables, external APIs, testing, Git, and deployment.
## API Structure

```text
/api/auth/
/api/customers/
/api/products/
/api/categories/
/api/cart/
/api/orders/
/api/addresses/
/api/delivery-zones/
/api/inventory/
/api/containers/
/api/drivers/
/api/deliveries/
/api/payments/
/api/subscriptions/
/api/notifications/
```

### Subscription API

```text
GET    /api/subscriptions/
POST   /api/subscriptions/
GET    /api/subscriptions/{id}/
PATCH  /api/subscriptions/{id}/
POST   /api/subscriptions/{id}/pause/
POST   /api/subscriptions/{id}/resume/
POST   /api/subscriptions/{id}/cancel/
```
## Security

- `JWT` authentication and role-based authorization
- Protected API endpoints and server-side validation
- Environment variables for secrets and API credentials
- Secure `M-Pesa` integration
- `CORS` configuration
- `.env` excluded from Git
- Customers can only access their own protected data

Example environment variables:

```text
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=your-database-url
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

**Never commit real credentials to GitHub.**
## `PostgreSQL` Database Setup

Create a `PostgreSQL` database for WaterFlow.

Example:

```sql
CREATE DATABASE waterflow_db;

```

Verify the database:

```sql
\l

```

Configure the database connection using environment variables.
## Installation

### Prerequisites

`Python 3.x`, `Node.js`, `npm`, `PostgreSQL`, `Git`, and `Visual Studio Code`.

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/WaterFlow.git
cd WaterFlow
```

### Backend

```bash
cd backend
python -m venv my_env
source my_env/Scripts/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

If `requirements.txt` is not available yet:

```bash
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary python-decouple django-cors-headers
pip freeze > requirements.txt
```

Backend: `http://127.0.0.1:8000/`

### PostgreSQL

Create a database such as:

```sql
CREATE DATABASE waterflow_db;
```

Configure the connection in `.env`.

### Environment Variables

Create `backend/.env` and add your database, `M-Pesa`, and `Google Maps` credentials. Never commit this file.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173/`

### API Documentation

Swagger/OpenAPI can be available at:

```text
http://127.0.0.1:8000/api/swagger/
```
## Testing

Testing will cover:

- Authentication and permissions
- Products and availability
- Cart and orders
- Stock validation
- `M-Pesa` payment initiation, callbacks, and verification
- Subscriptions and recurring orders
- Driver assignment and delivery status
- REST APIs using Django testing tools and `Postman`
## Development Plan — 21 Days

| Days | Work |
|---|---|
| 1–3 | Project setup, PostgreSQL, authentication, roles |
| 4–6 | Products, customers, cart |
| 7–9 | Orders, checkout, addresses, delivery zones |
| 10–12 | `M-Pesa` integration and payment verification |
| 13–15 | Inventory, containers, drivers, assignments |
| 16–18 | Deliveries, `Google Maps`, subscriptions |
| 19–20 | Notifications, dashboard, testing, bug fixing |
| 21 | Deployment, documentation, final demonstration |
## MVP Scope

### Customer
Registration, products, cart, checkout, addresses, `M-Pesa`, order tracking/history, notifications, and subscriptions.

### Management
Dashboard, products, customers, orders, inventory, containers, drivers, deliveries, payments, subscriptions, and basic reporting.

### Driver
Login, dashboard, assigned deliveries, customer/location details, `Google Maps`, status updates, and delivery history.
## Features Outside the Initial MVP

- Reviews and ratings
- Promotions and discount codes
- Loyalty points
- Live GPS tracking
- Advanced route optimization
- Vehicle management
- Advanced analytics
- SMS integration
- Complex automated billing
- Advanced audit logging
- PDF/CSV reporting
- Water batch/quality management
- Proof-of-delivery photos/signatures
- Customer support tickets

These may be considered future improvements.
## Future Improvements

Reviews, promotions, loyalty rewards, live GPS, route optimization, SMS/email notifications, advanced reports, vehicle management, proof of delivery, customer support, advanced subscription billing, water quality/batch management, and advanced analytics.
## Expected Benefits

- **Customers:** Easier ordering, `M-Pesa` payments, tracking, subscriptions, and address management.
- **Management:** Centralized records, inventory visibility, order/delivery coordination, payment monitoring, and reporting.
- **Drivers:** Clear assignments, customer/location access, and simple delivery status management.
## Success Criteria

The MVP is successful when customers can order and pay, management can manage products/inventory/drivers/orders, drivers can complete deliveries, subscriptions work, notifications appear, core tests pass, and the application can be deployed.
## `Git` Workflow

The project will use `Git` and `GitHub` for version control.

Create a feature branch:

```bash
git checkout -b feature-name

```

Add changes:

```bash
git add .

```

Commit changes:

```bash
git commit -m "Add feature"

```

Push the branch:

```bash
git push origin feature-name

```

The `main` branch will contain stable versions of the application.
## Contribution

Contributions can include UI improvements, features, bug fixes, performance/database/API improvements, tests, and documentation.

### How to Contribute

1. Fork and clone the repository.
2. Create a feature branch.
3. Make and test changes.
4. Commit and push.
5. Create a Pull Request.
## Deployment

- Frontend: React deployment platform
- Backend: `Render`
- Database: `PostgreSQL`
- Secrets: Production environment variables
## Project Status

**Current Status:** Project planning and initial setup.

Development will follow the `21-day` plan above.
## Author

**Derrick Weru**

**Project:** `WaterFlow — Water Delivery & Refill Management System`

Developed as a full-stack software engineering project demonstrating frontend/backend development, databases, REST APIs, authentication, external/payment integrations, testing, and deployment.
## License

This project is developed for educational purposes and may be used, modified, and distributed for learning and educational purposes