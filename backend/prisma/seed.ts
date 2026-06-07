import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Seeding initial data...')

	// Create a default user (Admin)
	const user = await prisma.user.upsert({
		where: { email: 'admin@fashion.uz' },
		update: {},
		create: {
			email: 'admin@fashion.uz',
			password: 'adminpassword', // In production, this should be hashed
			name: 'Admin User',
			role: 'ADMIN',
		},
	})

	// Create some products
	const products = [
		{
			sku: 'SKU-001',
			name: 'Classic Denim Jacket',
			category: 'Apparel',
			price: 89.99,
			size: 'L',
			color: 'Blue',
			inventory: { create: { quantity: 150, binLocation: 'A-12' } },
		},
		{
			sku: 'SKU-002',
			name: 'Slim Fit Cotton T-Shirt',
			category: 'Apparel',
			price: 24.99,
			size: 'M',
			color: 'White',
			inventory: { create: { quantity: 450, binLocation: 'B-04' } },
		},
		{
			sku: 'SKU-003',
			name: 'Luxury Silk Scarf',
			category: 'Accessories',
			price: 45.0,
			size: 'One Size',
			color: 'Red',
			inventory: { create: { quantity: 75, binLocation: 'C-01' } },
		},
	]

	for (const p of products) {
		await prisma.product.upsert({
			where: { sku: p.sku },
			update: {},
			create: p,
		})
	}

	// Create some customers
	const customers = [
		{
			email: 'customer1@retail.uz',
			name: 'Retailer A',
			password: 'customerpassword',
			role: 'CUSTOMER' as const,
		},
		{
			email: 'customer2@retail.uz',
			name: 'Retailer B',
			password: 'customerpassword',
			role: 'CUSTOMER' as const,
		},
	]

	for (const c of customers) {
		const customer = await prisma.user.upsert({
			where: { email: c.email },
			update: {},
			create: c,
		})

		// Create an order for each customer
		await prisma.order.upsert({
			where: { orderNumber: `ORD-${customer.id.substring(0, 5)}` },
			update: {},
			create: {
				orderNumber: `ORD-${customer.id.substring(0, 5)}`,
				customerId: customer.id,
				totalAmount: 1250.5,
				status: 'PROCESSING',
				shippingAddress: 'Tashkent, Uzbekistan',
			},
		})
	}

	console.log('Seeding completed!')
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
