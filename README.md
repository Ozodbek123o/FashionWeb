# FashionOS: Wholesale Garment Distribution Platform

This project is a full-stack integrated solution for a Wholesale Clothing Company, featuring **ERP**, **CRM**, and **WMS** modules. It is designed to be cloud-ready and scalable.

## 🚀 Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM

---

## 🛠️ Local Setup & Deployment

### 1. Database Configuration
Create a `.env` file in the `backend/` directory and add your cloud PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
PORT=5000
NODE_ENV=production
```

### 2. Backend Initialization
Navigate to the `backend/` folder and run the following commands:
```bash
# Install dependencies
npm install

# Generate Prisma Client (strict type-safety)
npx prisma generate

# Run database migrations to create tables
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### 3. Frontend Initialization
Navigate to the `frontend/` folder:
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 🧪 Testing & Validation (BTEC Assignment Evidence)

### 1. API Health Check
To verify the system is ready for a Cloud Load Balancer, run:
```bash
curl http://localhost:5000/api/health
```
**Expected Output:** `{"status": "healthy", ...}` (HTTP 200 OK)

### 2. Load Testing (Scalability Proof)
Using **Apache Bench (ab)**, simulate 1000 requests with 50 concurrent users to test the Order API's robustness:
```bash
ab -n 1000 -c 50 -p order_payload.json -T application/json http://localhost:5000/api/orders/bulk
```
**Verification for Screenshots:**
- Look for `Complete requests: 1000`
- Look for `Failed requests: 0`
- Ensure `Requests per second` meets business throughput requirements.

### 3. Database Integrity
Verify that the Prisma Transaction logic correctly deducted stock after a bulk order:
```bash
# Check WMS inventory via API
curl http://localhost:5000/api/wms/inventory
```

---

## ☁️ Cloud Architecture Notes
- **Dynamic Port Binding:** The server uses `process.env.PORT` to bind correctly to AWS Elastic Beanstalk or Render.
- **Security:** In production, ensure the database is in a Private Subnet and only accessible via the Backend API Security Group.
- **WMS Efficiency:** The `binLocation` attribute in the schema allows for warehouse route optimization.
