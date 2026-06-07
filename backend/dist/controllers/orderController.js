"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createBulkOrder = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Handles Bulk Wholesale Orders with Senior-level reliability
 */
const createBulkOrder = async (req, res, next) => {
    const { customerId, items, shippingAddress } = req.body;
    // Basic validation (In a real app, use Zod)
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return next(new errorHandler_1.AppError('Invalid order data. Customer ID and items are required.', 400));
    }
    try {
        const result = await prisma_1.default.$transaction(async (tx) => {
            let totalAmount = 0;
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    include: { inventory: true },
                });
                if (!product)
                    throw new errorHandler_1.AppError(`Product ${item.productId} not found`, 404);
                if (!product.inventory)
                    throw new errorHandler_1.AppError(`Product ${product.name} has no inventory record`, 400);
                if (product.inventory.quantity < item.quantity) {
                    throw new errorHandler_1.AppError(`Insufficient stock for ${product.name}. Stock: ${product.inventory.quantity}`, 400);
                }
                await tx.inventoryItem.update({
                    where: { productId: product.id },
                    data: { quantity: { decrement: item.quantity } },
                });
                totalAmount += Number(product.price) * item.quantity;
            }
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            return await tx.order.create({
                data: {
                    orderNumber,
                    customerId,
                    totalAmount,
                    shippingAddress,
                    status: 'PROCESSING',
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: { items: true },
            });
        });
        res.status(201).json({
            status: 'success',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBulkOrder = createBulkOrder;
const getAllOrders = async (req, res, next) => {
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
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
