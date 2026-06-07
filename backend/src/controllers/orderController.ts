import { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

/**
 * Handles Bulk Wholesale Orders with Senior-level reliability
 */
export const createBulkOrder = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { customerId, items, shippingAddress } = req.body

	// Basic validation (In a real app, use Zod)
	if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
		return next(
			new AppError(
				'Invalid order data. Customer ID and items are required.',
				400,
			),
		)
	}

	try {
		const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
			let totalAmount = 0

			for (const item of items) {
				const product = await tx.product.findUnique({
					where: { id: item.productId },
					include: { inventory: true },
				})

				if (!product)
					throw new AppError(`Product ${item.productId} not found`, 404)
				if (!product.inventory)
					throw new AppError(
						`Product ${product.name} has no inventory record`,
						400,
					)

				if (product.inventory.quantity < item.quantity) {
					throw new AppError(
						`Insufficient stock for ${product.name}. Stock: ${product.inventory.quantity}`,
						400,
					)
				}

				await tx.inventoryItem.update({
					where: { productId: product.id },
					data: { quantity: { decrement: item.quantity } },
				})

				totalAmount += Number(product.price) * item.quantity
			}

			const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
			return await tx.order.create({
				data: {
					orderNumber,
					customerId,
					totalAmount,
					shippingAddress,
					status: 'PROCESSING',
					items: {
						create: items.map((item: any) => ({
							productId: item.productId,
							quantity: item.quantity,
							price: item.price,
						})),
					},
				},
				include: { items: true },
			})
		})

		res.status(201).json({
			status: 'success',
			data: result,
		})
	} catch (error) {
		next(error)
	}
}

export const getAllOrders = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const orders = await prisma.order.findMany({
			include: {
				customer: { select: { name: true, email: true } },
				items: { include: { product: true } },
			},
			orderBy: { createdAt: 'desc' },
		})
		res.json({ status: 'success', data: orders })
	} catch (error) {
		next(error)
	}
}
