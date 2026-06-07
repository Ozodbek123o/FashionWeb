"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const orderController_1 = require("./controllers/orderController");
const prisma_1 = __importDefault(require("./lib/prisma"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & Logging
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logger for development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
    });
}
/**
 * HEALTH CHECK
 */
app.get('/api/health', async (req, res, next) => {
    try {
        // Check DB connection
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'healthy',
            db: 'connected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        next(new errorHandler_1.AppError('Database connection failed', 500));
    }
});
/**
 * PRODUCT CATALOG API
 */
app.get('/api/products', async (req, res, next) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: { inventory: true },
        });
        res.json({ status: 'success', data: products });
    }
    catch (error) {
        next(error);
    }
});
/**
 * WMS (Warehouse Management System) API
 */
app.get('/api/wms/inventory', async (req, res, next) => {
    try {
        const inventory = await prisma_1.default.inventoryItem.findMany({
            include: { product: true },
        });
        res.json({ status: 'success', data: inventory });
    }
    catch (error) {
        next(error);
    }
});
app.post('/api/wms/stock-update', async (req, res, next) => {
    const { productId, quantity, binLocation } = req.body;
    try {
        const updated = await prisma_1.default.inventoryItem.update({
            where: { productId },
            data: { quantity, binLocation, updatedAt: new Date() },
        });
        res.json({ status: 'success', data: updated });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ORDER MANAGEMENT (ERP Integration)
 */
app.post('/api/orders/bulk', orderController_1.createBulkOrder);
app.get('/api/orders', orderController_1.getAllOrders);
/**
 * CRM (Customer Relationship Management) API
 */
app.get('/api/crm/clients', async (req, res, next) => {
    try {
        const clients = await prisma_1.default.user.findMany({
            where: { role: 'CUSTOMER' },
            include: {
                orders: { take: 5, orderBy: { createdAt: 'desc' } },
                interactions: { take: 3, orderBy: { date: 'desc' } },
            },
        });
        res.json({ status: 'success', data: clients });
    }
    catch (error) {
        next(error);
    }
});
// 404 Handler
app.use((req, res, next) => {
    next(new errorHandler_1.AppError(`Route ${req.originalUrl} not found`, 404));
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Fashion Backend Server running on port ${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
