"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const orderController_1 = require("./controllers/orderController");
const cors_2 = require("./lib/cors");
const prisma_1 = __importDefault(require("./lib/prisma"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGINS = (0, cors_2.parseAllowedOrigins)(process.env.FRONTEND_ORIGIN);
// Security & Logging
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if ((0, cors_2.isOriginAllowed)(origin, FRONTEND_ORIGINS)) {
            return callback(null, true);
        }
        return callback(new errorHandler_1.AppError(`CORS blocked for origin: ${origin}`, 403));
    },
}));
app.use(express_1.default.json());
// Request logger for development
if (process.env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
    });
}
/**
 * HEALTH CHECK
 */
app.get('/api/health', async (_req, res, _next) => {
    try {
        // Check DB connection
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'success',
            data: {
                health: 'healthy',
                db: 'connected',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        res.status(200).json({
            status: 'success',
            data: {
                health: 'operational',
                db: 'disconnected',
                mode: 'mock_data',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    }
});
/**
 * IN-MEMORY MOCK STORE (Persists changes during runtime if DB is offline)
 */
class MockStore {
    constructor() {
        this.products = [
            {
                id: '1',
                sku: 'SKU-001',
                name: 'Classic Denim Jacket',
                category: 'Apparel',
                price: 89.99,
                inventory: { quantity: 150, binLocation: 'A-12' },
            },
            {
                id: '2',
                sku: 'SKU-002',
                name: 'Slim Fit Cotton T-Shirt',
                category: 'Apparel',
                price: 24.99,
                inventory: { quantity: 450, binLocation: 'B-04' },
            },
            {
                id: '3',
                sku: 'SKU-003',
                name: 'Luxury Silk Scarf',
                category: 'Accessories',
                price: 45.0,
                inventory: { quantity: 75, binLocation: 'C-01' },
            },
        ];
        this.orders = [
            {
                id: '1',
                orderNumber: 'ORD-12345',
                totalAmount: 1250.5,
                status: 'PROCESSING',
                createdAt: new Date().toISOString(),
                customer: { name: 'Wholesale Corp A' },
            },
            {
                id: '2',
                orderNumber: 'ORD-12346',
                totalAmount: 450.0,
                status: 'SHIPPED',
                createdAt: new Date().toISOString(),
                customer: { name: 'Retailer B' },
            },
        ];
        this.clients = [
            {
                id: '1',
                name: 'Wholesale Corp A',
                email: 'contact@wholesale-a.com',
                orders: [{}, {}],
                interactions: [],
            },
            {
                id: '2',
                name: 'Retailer B',
                email: 'sales@retailer-b.com',
                orders: [{}],
                interactions: [],
            },
        ];
    }
    addProduct(data) {
        const newProduct = {
            id: Math.random().toString(36).substring(2, 9),
            ...data,
            price: Number(data.price),
            size: data.size || 'M',
            color: data.color || 'Default',
            inventory: {
                quantity: Number(data.quantity || 0),
                binLocation: data.binLocation || 'UNASSIGNED',
            },
        };
        this.products.push(newProduct);
        return newProduct;
    }
    updateStock(productId, quantity, binLocation) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.inventory.quantity = Number(quantity);
            product.inventory.binLocation = binLocation;
            return product.inventory;
        }
        return null;
    }
}
const mockStore = new MockStore();
/**
 * PRODUCT CATALOG API
 */
app.get('/api/products', async (_req, res, _next) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: { inventory: true },
        });
        res.json({ status: 'success', data: products });
    }
    catch (error) {
        console.warn('DB connection failed, returning mock products');
        res.json({ status: 'success', data: mockStore.products });
    }
});
app.post('/api/products', async (req, res, _next) => {
    const { name, sku, category, price, quantity, binLocation, size, color } = req.body;
    try {
        const product = await prisma_1.default.product.create({
            data: {
                name,
                sku,
                category,
                price,
                size: size || 'M',
                color: color || 'Default',
                inventory: { create: { quantity, binLocation } },
            },
            include: { inventory: true },
        });
        res.status(201).json({ status: 'success', data: product });
    }
    catch (error) {
        console.warn('DB operation failed, using mock store');
        const product = mockStore.addProduct(req.body);
        res.status(201).json({ status: 'success', data: product });
    }
});
/**
 * WMS (Warehouse Management System) API
 */
app.get('/api/wms/inventory', async (_req, res, _next) => {
    try {
        const inventory = await prisma_1.default.inventoryItem.findMany({
            include: { product: true },
        });
        res.json({ status: 'success', data: inventory });
    }
    catch (error) {
        console.warn('DB connection failed, returning mock inventory');
        res.json({
            status: 'success',
            data: mockStore.products.map(p => ({ ...p.inventory, product: p })),
        });
    }
});
app.post('/api/wms/stock-update', async (req, res, _next) => {
    const { productId, quantity, binLocation } = req.body;
    try {
        const updated = await prisma_1.default.inventoryItem.update({
            where: { productId },
            data: {
                quantity: Number(quantity),
                binLocation,
                updatedAt: new Date(),
            },
        });
        res.json({ status: 'success', data: updated });
    }
    catch (error) {
        const updated = mockStore.updateStock(productId, quantity, binLocation);
        res.json({ status: 'success', data: updated });
    }
});
/**
 * ORDER MANAGEMENT (ERP Integration)
 */
app.post('/api/orders/bulk', orderController_1.createBulkOrder);
app.get('/api/orders', async (_req, res, _next) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: {
                customer: { select: { name: true, email: true } },
                items: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ status: 'success', data: orders });
    }
    catch (error) {
        console.warn('DB connection failed, returning mock orders');
        res.json({ status: 'success', data: mockStore.orders });
    }
});
/**
 * CRM (Customer Relationship Management) API
 */
app.get('/api/crm/clients', async (_req, res, _next) => {
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
        console.warn('DB connection failed, returning mock clients');
        res.json({ status: 'success', data: mockStore.clients });
    }
});
app.post('/api/crm/clients/:id/interactions', async (req, res, _next) => {
    const { id } = req.params;
    const { type, notes, staffName } = req.body;
    try {
        const interaction = await prisma_1.default.customerInteraction.create({
            data: {
                customerId: id,
                type,
                notes,
                staffName,
            },
        });
        res.status(201).json({ status: 'success', data: interaction });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: 'error', message: 'Failed to create interaction' });
    }
});
// 404 Handler
app.use((req, _res, next) => {
    next(new errorHandler_1.AppError(`Route ${req.originalUrl} not found`, 404));
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Fashion Backend Server running on port ${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
