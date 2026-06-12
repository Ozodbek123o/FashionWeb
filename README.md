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
FRONTEND_ORIGIN=http://localhost:3008
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

For production or AWS deployments, create `frontend/.env.production` and point it to your backend:
```env
VITE_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:5000
```

If you later place the backend behind Nginx or a load balancer on the same domain, you can leave this empty and use `/api` via reverse proxy instead.

## AWS EC2 Production Deploy

This repository now includes a production-ready Docker Compose setup:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx/default.conf`
- `docker-compose.prod.yml`

### 1. Prepare backend environment

Copy the example file and update it with your real values:

```bash
cp backend/.env.example backend/.env
```

Example:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
PORT=5000
NODE_ENV=production
FRONTEND_ORIGIN=http://YOUR_EC2_PUBLIC_IP
```

### 2. Deploy on EC2

Install Docker and Docker Compose on your instance, then run:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Open the required AWS Security Group ports

- Allow inbound `80` for HTTP
- Allow inbound `22` for SSH
- You do not need to expose backend port `5000` publicly when using the included Nginx reverse proxy

### 4. Verify

Open:

```bash
http://YOUR_EC2_PUBLIC_IP
```

Health check from the server:

```bash
curl http://localhost/api/health
```

This setup serves the frontend from Nginx and forwards `/api/*` requests to the backend container automatically.

## CI/CD

GitHub Actions based CI/CD is configured for this repository.

- CI workflow: `.github/workflows/ci.yml`
- CD workflow: `.github/workflows/deploy.yml`
- Security scan: `.github/workflows/codeql.yml`
- Dependency updates: `.github/dependabot.yml`
- Full guide: `docs/ci-cd.md`

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
- **Frontend/API Routing:** Vite's `server.proxy` works only in local development. On AWS, the frontend must either call the backend with `VITE_API_BASE_URL` or sit behind an Nginx reverse proxy that forwards `/api` to the backend service.
- **Container Startup:** The backend container runs `prisma migrate deploy` before starting, so production schema changes are applied automatically.
