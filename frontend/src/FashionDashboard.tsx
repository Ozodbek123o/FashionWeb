import {
	ArrowUpRight,
	Bell,
	Clock,
	LogOut,
	Menu,
	Package,
	Search,
	Settings,
	TrendingUp,
	Users,
	Warehouse,
} from 'lucide-react'
import React, { useState } from 'react'
import { Modal } from './components/Modal'
import { StatCard } from './components/StatCard'
import { Toast, ToastType } from './components/Toast'
import { useApi } from './hooks/useApi'

// Shared Types
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'

interface Product {
	id: string
	sku: string
	name: string
	category: string
	price: number
	inventory?: { quantity: number; binLocation: string }
}

interface Order {
	id: string
	orderNumber: string
	totalAmount: number
	status: OrderStatus
	createdAt: string
	customer: { name: string }
}

const FashionDashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'ERP' | 'WMS' | 'CRM'>('ERP')
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
	const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [toast, setToast] = useState<{
		message: string
		type: ToastType
	} | null>(null)

	const [newProduct, setNewProduct] = useState({
		name: '',
		sku: '',
		category: 'Apparel',
		price: 0,
		quantity: 0,
		binLocation: '',
	})

	const [adjustData, setAdjustData] = useState({
		quantity: 0,
		binLocation: '',
	})

	const [selectedClient, setSelectedClient] = useState<any | null>(null)
	const [isClientModalOpen, setIsClientModalOpen] = useState(false)

	const { data: healthData } = useApi<{ status: string }>('/api/health')
	const isApiHealthy =
		healthData?.status === 'healthy' ||
		healthData?.status === 'success' ||
		healthData?.status === 'operational'

	const {
		data: productsData,
		loading: pLoading,
		refetch: refetchProducts,
	} = useApi<Product[]>('/api/products')

	const showToast = (message: string, type: ToastType = 'success') => {
		setToast({ message, type })
	}

	const handleAddProduct = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const response = await fetch('/api/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newProduct),
			})
			if (response.ok) {
				showToast('Product added successfully!')
				setIsAddProductModalOpen(false)
				refetchProducts()
				setNewProduct({
					name: '',
					sku: '',
					category: 'Apparel',
					price: 0,
					quantity: 0,
					binLocation: '',
				})
			} else {
				showToast('Failed to add product', 'error')
			}
		} catch (error) {
			showToast('Network error', 'error')
		}
	}

	const handleAdjustStock = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedProduct) return
		try {
			const response = await fetch('/api/wms/stock-update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId: selectedProduct.id,
					...adjustData,
				}),
			})
			if (response.ok) {
				showToast('Stock adjusted successfully!')
				setIsAdjustStockModalOpen(false)
				refetchProducts()
			} else {
				showToast('Failed to adjust stock', 'error')
			}
		} catch (error) {
			showToast('Network error', 'error')
		}
	}
	const {
		data: ordersData,
		loading: oLoading,
		refetch: refetchOrders,
	} = useApi<Order[]>('/api/orders')
	const {
		data: clientsData,
		loading: cLoading,
		refetch: refetchClients,
	} = useApi<any[]>('/api/crm/clients')

	const products = (productsData || []) as Product[]
	const orders = (ordersData || []) as Order[]
	const clients = (clientsData || []) as any[]

	const fetchDashboardData = () => {
		refetchProducts()
		refetchOrders()
		refetchClients()
	}

	const isLoading = pLoading || oLoading || cLoading

	return (
		<div className='min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900'>
			{/* Sidebar - Senior Design */}
			<aside
				className={`${
					isSidebarOpen ? 'w-72' : 'w-24'
				} bg-white border-r border-slate-200 hidden lg:flex lg:flex-col transition-all duration-300 ease-in-out overflow-hidden`}
			>
				<div className='p-8'>
					<div className='flex items-center space-x-3 mb-10'>
						<div className='bg-indigo-600 w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200'>
							<Package className='text-white' size={22} />
						</div>
						{isSidebarOpen && (
							<span className='font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 whitespace-nowrap'>
								FashionOS
							</span>
						)}
					</div>

					<nav className='space-y-1.5'>
						<SidebarItem
							active={activeTab === 'ERP'}
							onClick={() => setActiveTab('ERP')}
							icon={<TrendingUp size={20} />}
							label='Dashboard'
							badge={isSidebarOpen ? 'Live' : undefined}
							showLabel={isSidebarOpen}
						/>
						<SidebarItem
							active={activeTab === 'WMS'}
							onClick={() => setActiveTab('WMS')}
							icon={<Warehouse size={20} />}
							label='Warehouse'
							showLabel={isSidebarOpen}
						/>
						<SidebarItem
							active={activeTab === 'CRM'}
							onClick={() => setActiveTab('CRM')}
							icon={<Users size={20} />}
							label='Clients'
							showLabel={isSidebarOpen}
						/>
					</nav>
				</div>

				<div className='mt-auto p-8 space-y-4'>
					{isSidebarOpen && (
						<div className='bg-slate-50 p-4 rounded-2xl border border-slate-100'>
							<p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-2'>
								System Status
							</p>
							<div className='flex items-center space-x-2'>
								<div
									className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${
										isApiHealthy
											? 'bg-emerald-500'
											: 'bg-rose-500 shadow-rose-500/50'
									}`}
								/>
								<span className='text-sm font-semibold text-slate-700'>
									{isApiHealthy ? 'API Operational' : 'API Connection Issue'}
								</span>
							</div>
						</div>
					)}
					<button
						type='button'
						title='Sign Out'
						className='flex items-center space-x-3 text-slate-500 hover:text-rose-500 transition-colors font-medium px-4'
					>
						<LogOut size={20} className='min-w-[20px]' />
						{isSidebarOpen && <span>Sign Out</span>}
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className='flex-1 flex flex-col h-screen overflow-hidden'>
				{/* Top Header */}
				<header className='h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10'>
					<div className='flex items-center space-x-4'>
						<button
							type='button'
							title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className='p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-500 hidden lg:block'
						>
							<Menu size={20} />
						</button>
						<div className='relative w-96'>
							<Search
								className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
								size={18}
							/>
							<input
								type='text'
								title='Search'
								placeholder='Search orders, SKU, or clients...'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all'
							/>
						</div>
					</div>

					<div className='flex items-center space-x-4'>
						<button
							type='button'
							title='Notifications'
							className='p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative'
						>
							<Bell size={20} />
							<span className='absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white' />
						</button>
						<button
							type='button'
							title='Settings'
							className='p-2 text-slate-500 hover:bg-slate-50 rounded-lg'
						>
							<Settings size={20} />
						</button>
						<div className='h-8 w-[1px] bg-slate-200 mx-2' />
						<div className='flex items-center space-x-3'>
							<div className='text-right hidden sm:block'>
								<p className='text-sm font-bold text-slate-900'>Admin User</p>
								<p className='text-[10px] font-bold text-indigo-600 uppercase tracking-wider'>
									Senior Manager
								</p>
							</div>
							<div className='w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-inner flex items-center justify-center text-white font-bold'>
								AU
							</div>
						</div>
					</div>
				</header>

				{/* Scrollable Dashboard Area */}
				<div className='flex-1 overflow-y-auto p-8 space-y-8'>
					<section>
						<div className='flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4'>
							<div>
								<h2 className='text-sm font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1'>
									{activeTab === 'ERP'
										? 'Resource Planning'
										: activeTab === 'WMS'
											? 'Warehouse Ops'
											: 'Customer Relations'}
								</h2>
								<h1 className='text-3xl font-extrabold text-slate-900 tracking-tight'>
									{activeTab === 'ERP'
										? 'Dashboard'
										: activeTab === 'WMS'
											? 'Warehouse'
											: 'Clients'}{' '}
									Overview
								</h1>
							</div>
							<div className='flex space-x-3'>
								<button
									type='button'
									title='Export Report'
									className='bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95'
								>
									Export Report
								</button>
								<button
									type='button'
									title='Refresh Live Data'
									onClick={() => fetchDashboardData()}
									className='bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95'
								>
									Refresh Live Data
								</button>
							</div>
						</div>

						{/* Stats Grid */}
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<StatCard
								title='Inventory Level'
								value={products.reduce(
									(acc: number, p: Product) =>
										acc + (p.inventory?.quantity || 0),
									0,
								)}
								icon={<Package className='text-indigo-600' />}
								trend='+8.2%'
							/>
							<StatCard
								title='Active Shipments'
								value={
									orders.filter((o: Order) => o.status === 'PROCESSING').length
								}
								icon={<Clock className='text-amber-500' />}
								trend='On track'
								trendType='neutral'
							/>
							<StatCard
								title='Revenue (MTD)'
								value={`$${orders.reduce((acc: number, o: Order) => acc + o.totalAmount, 0).toLocaleString()}`}
								icon={<TrendingUp className='text-emerald-500' />}
								trend='+12.5%'
							/>
							<StatCard
								title='Wholesale Retention'
								value='94%'
								icon={<Users className='text-purple-500' />}
								trend='+2.1%'
							/>
						</div>
					</section>

					{/* Dynamic Content Area */}
					<div className='bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[500px]'>
						{isLoading ? (
							<div className='flex flex-col items-center justify-center h-[500px] space-y-4'>
								<div className='w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin' />
								<p className='text-slate-400 font-medium animate-pulse'>
									Synchronizing live data...
								</p>
							</div>
						) : (
							<div className='p-8'>
								{activeTab === 'ERP' && (
									<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
										<div className='flex items-center justify-between mb-8'>
											<h3 className='text-xl font-bold text-slate-900'>
												Recent Transactions
											</h3>
											<button
												type='button'
												title='View All Orders'
												className='text-indigo-600 text-sm font-bold hover:underline'
											>
												View All Orders
											</button>
										</div>
										<div className='overflow-x-auto'>
											<table className='w-full'>
												<thead>
													<tr className='text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100'>
														<th className='pb-4 text-left pl-2'>Identifier</th>
														<th className='pb-4 text-left'>Partner Entity</th>
														<th className='pb-4 text-left'>Capital Flow</th>
														<th className='pb-4 text-left'>Status</th>
														<th className='pb-4 text-right pr-2'>Timeline</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-slate-50'>
													{orders.map((order: Order) => (
														<tr
															key={order.id}
															className='group hover:bg-slate-50/50 transition-colors'
														>
															<td className='py-5 pl-2'>
																<span className='font-bold text-slate-900'>
																	{order.orderNumber}
																</span>
															</td>
															<td className='py-5'>
																<div className='flex items-center space-x-3'>
																	<div className='w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs font-bold'>
																		{order.customer.name.charAt(0)}
																	</div>
																	<span className='text-slate-600 font-medium'>
																		{order.customer.name}
																	</span>
																</div>
															</td>
															<td className='py-5'>
																<span className='text-slate-900 font-extrabold'>
																	${Number(order.totalAmount).toLocaleString()}
																</span>
															</td>
															<td className='py-5'>
																<SeniorStatusBadge status={order.status} />
															</td>
															<td className='py-5 text-right pr-2 text-slate-400 text-sm font-medium'>
																{new Date(order.createdAt).toLocaleDateString(
																	undefined,
																	{ month: 'short', day: 'numeric' },
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}

								{activeTab === 'WMS' && (
									<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
										<div className='flex items-center justify-between mb-8'>
											<h3 className='text-xl font-bold text-slate-900'>
												Inventory Distribution
											</h3>
											<div className='flex space-x-3'>
												<button
													type='button'
													title='Add New Product'
													onClick={() => setIsAddProductModalOpen(true)}
													className='bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95'
												>
													+ Add Product
												</button>
												<div className='bg-slate-100 p-1 rounded-lg flex'>
													<button
														type='button'
														title='Grid View'
														className='px-3 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md'
													>
														Grid
													</button>
													<button
														type='button'
														title='List View'
														className='px-3 py-1.5 text-xs font-bold text-slate-500'
													>
														List
													</button>
												</div>
											</div>
										</div>
										<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
											{products.map((product: Product) => (
												<div
													key={product.id}
													className='group bg-white border border-slate-100 rounded-3xl p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300'
												>
													<div className='flex justify-between items-start mb-6'>
														<div className='bg-slate-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors'>
															<Package
																className='text-slate-400 group-hover:text-indigo-600'
																size={24}
															/>
														</div>
														<div className='text-right'>
															<p className='text-2xl font-black text-slate-900'>
																{product.inventory?.quantity || 0}
															</p>
															<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
																Available Units
															</p>
														</div>
													</div>
													<div>
														<span className='text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider'>
															{product.category}
														</span>
														<h4 className='text-lg font-bold text-slate-900 mt-2 line-clamp-1'>
															{product.name}
														</h4>
														<div className='flex items-center mt-4 space-x-4 text-xs font-bold text-slate-400'>
															<div className='flex items-center'>
																<Warehouse size={14} className='mr-1.5' />
																{product.inventory?.binLocation}
															</div>
															<div className='flex items-center'>
																<Search size={14} className='mr-1.5' />
																{product.sku}
															</div>
														</div>
													</div>
													<button
														type='button'
														title='Adjust Stock Levels'
														onClick={() => {
															setSelectedProduct(product)
															setAdjustData({
																quantity: product.inventory?.quantity || 0,
																binLocation:
																	product.inventory?.binLocation || '',
															})
															setIsAdjustStockModalOpen(true)
														}}
														className='w-full mt-6 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300'
													>
														Adjust Stock Levels
													</button>
												</div>
											))}
										</div>
									</div>
								)}

								{activeTab === 'CRM' && (
									<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
										<h3 className='text-xl font-bold text-slate-900 mb-8'>
											Client Relationship Matrix
										</h3>
										<div className='grid gap-4'>
											{clients.map((client: any) => (
												<div
													key={client.id}
													className='flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group'
												>
													<div className='flex items-center space-x-5'>
														<div className='w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 font-black text-xl border border-slate-100'>
															{client.name.charAt(0)}
														</div>
														<div>
															<h4 className='font-bold text-slate-900 text-lg'>
																{client.name}
															</h4>
															<p className='text-sm text-slate-400 font-medium'>
																{client.email}
															</p>
														</div>
													</div>
													<div className='flex items-center space-x-8'>
														<div className='text-right hidden md:block'>
															<p className='text-sm font-bold text-slate-900'>
																{client.orders.length} Bulk Orders
															</p>
															<p className='text-xs text-emerald-500 font-bold'>
																Active Partner
															</p>
														</div>
														<button
															type='button'
															title='View details'
															onClick={() => {
																setSelectedClient(client)
																setIsClientModalOpen(true)
															}}
															className='bg-white p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm'
														>
															<ArrowUpRight size={20} />
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Modals */}
			<Modal
				isOpen={isAddProductModalOpen}
				onClose={() => setIsAddProductModalOpen(false)}
				title='Add New Product'
			>
				<form onSubmit={handleAddProduct} className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								Name
							</label>
							<input
								required
								type='text'
								title='Product Name'
								placeholder='Enter product name'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={newProduct.name}
								onChange={e =>
									setNewProduct({ ...newProduct, name: e.target.value })
								}
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								SKU
							</label>
							<input
								required
								type='text'
								title='Product SKU'
								placeholder='Enter SKU'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={newProduct.sku}
								onChange={e =>
									setNewProduct({ ...newProduct, sku: e.target.value })
								}
							/>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								Category
							</label>
							<select
								title='Product Category'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={newProduct.category}
								onChange={e =>
									setNewProduct({ ...newProduct, category: e.target.value })
								}
							>
								<option>Apparel</option>
								<option>Accessories</option>
								<option>Footwear</option>
							</select>
						</div>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								Price ($)
							</label>
							<input
								required
								type='number'
								step='0.01'
								title='Product Price'
								placeholder='0.00'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={newProduct.price}
								onChange={e =>
									setNewProduct({
										...newProduct,
										price: parseFloat(e.target.value),
									})
								}
							/>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								Initial Stock
							</label>
							<input
								required
								type='number'
								title='Initial Stock Quantity'
								placeholder='0'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={newProduct.quantity}
								onChange={e =>
									setNewProduct({
										...newProduct,
										quantity: parseInt(e.target.value),
									})
								}
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								Bin Location
							</label>
							<input
								required
								type='text'
								title='Bin Location'
								placeholder='e.g. A-12'
								className='w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={newProduct.binLocation}
								onChange={e =>
									setNewProduct({ ...newProduct, binLocation: e.target.value })
								}
							/>
						</div>
					</div>
					<button
						type='submit'
						title='Save Product'
						className='w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-4'
					>
						Save Product
					</button>
				</form>
			</Modal>

			<Modal
				isOpen={isAdjustStockModalOpen}
				onClose={() => setIsAdjustStockModalOpen(false)}
				title={`Adjust Stock: ${selectedProduct?.name}`}
			>
				<form onSubmit={handleAdjustStock} className='space-y-6'>
					<div className='bg-indigo-50 p-6 rounded-3xl border border-indigo-100'>
						<div className='flex justify-between items-center mb-4'>
							<span className='text-sm font-bold text-indigo-600 uppercase'>
								Current Status
							</span>
							<span className='bg-white px-3 py-1 rounded-lg text-xs font-black text-indigo-600 shadow-sm'>
								{selectedProduct?.sku}
							</span>
						</div>
						<div className='grid grid-cols-2 gap-8'>
							<div>
								<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
									On Hand
								</p>
								<p className='text-3xl font-black text-slate-900'>
									{selectedProduct?.inventory?.quantity}
								</p>
							</div>
							<div>
								<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
									Location
								</p>
								<p className='text-3xl font-black text-slate-900'>
									{selectedProduct?.inventory?.binLocation}
								</p>
							</div>
						</div>
					</div>

					<div className='space-y-4'>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								New Quantity
							</label>
							<input
								required
								type='number'
								title='New Stock Quantity'
								placeholder='Enter quantity'
								className='w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={adjustData.quantity}
								onChange={e =>
									setAdjustData({
										...adjustData,
										quantity: parseInt(e.target.value),
									})
								}
							/>
						</div>
						<div className='space-y-1'>
							<label className='text-xs font-bold text-slate-500 uppercase'>
								New Bin Location
							</label>
							<input
								required
								type='text'
								title='New Bin Location'
								placeholder='e.g. B-04'
								className='w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20'
								value={adjustData.binLocation}
								onChange={e =>
									setAdjustData({ ...adjustData, binLocation: e.target.value })
								}
							/>
						</div>
					</div>

					<button
						type='submit'
						title='Update Inventory'
						className='w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200'
					>
						Update Inventory
					</button>
				</form>
			</Modal>

			<Modal
				isOpen={isClientModalOpen}
				onClose={() => setIsClientModalOpen(false)}
				title='Client Profile'
			>
				{selectedClient && (
					<div className='space-y-8'>
						<div className='flex items-center space-x-6'>
							<div className='w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100'>
								{selectedClient.name.charAt(0)}
							</div>
							<div>
								<h4 className='text-2xl font-black text-slate-900'>
									{selectedClient.name}
								</h4>
								<p className='text-slate-400 font-bold'>
									{selectedClient.email}
								</p>
								<div className='flex items-center mt-2 space-x-2'>
									<span className='px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded uppercase tracking-wider'>
										Premium Partner
									</span>
									<span className='px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-wider'>
										ID: {selectedClient.id.substring(0, 8)}
									</span>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='bg-slate-50 p-4 rounded-2xl border border-slate-100'>
								<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
									Total Orders
								</p>
								<p className='text-xl font-black text-slate-900'>
									{selectedClient.orders.length}
								</p>
							</div>
							<div className='bg-slate-50 p-4 rounded-2xl border border-slate-100'>
								<p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
									Last Interaction
								</p>
								<p className='text-xl font-black text-slate-900'>2 Days Ago</p>
							</div>
						</div>

						<div>
							<h5 className='text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center'>
								<Clock size={16} className='mr-2 text-indigo-600' />
								Recent Activity
							</h5>
							<div className='space-y-3'>
								{selectedClient.orders.length > 0 ? (
									selectedClient.orders.map((_: any, idx: number) => (
										<div
											key={idx}
											className='flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl'
										>
											<div>
												<p className='text-xs font-bold text-slate-900'>
													Bulk Order #{idx + 101}
												</p>
												<p className='text-[10px] text-slate-400 font-bold'>
													Processed via ERP
												</p>
											</div>
											<SeniorStatusBadge status='DELIVERED' />
										</div>
									))
								) : (
									<p className='text-sm text-slate-400 font-medium italic'>
										No recent transactions found.
									</p>
								)}
							</div>
						</div>

						<button
							type='button'
							title='Generate Client Report'
							className='w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all'
						>
							Generate Full Report
						</button>
					</div>
				)}
			</Modal>

			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	)
}

// Senior Component Library
const SidebarItem = ({
	active,
	onClick,
	icon,
	label,
	badge,
	showLabel = true,
}: {
	active: boolean
	onClick: () => void
	icon: React.ReactNode
	label: string
	badge?: string
	showLabel?: boolean
}) => (
	<button
		type='button'
		title={label}
		onClick={onClick}
		className={`w-full flex items-center ${
			showLabel ? 'justify-between px-4' : 'justify-center'
		} py-3.5 rounded-xl transition-all duration-300 group ${
			active
				? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
				: 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
		}`}
	>
		<div className='flex items-center space-x-3'>
			<span
				className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}
			>
				{icon}
			</span>
			{showLabel && (
				<span className='font-bold text-sm tracking-tight'>{label}</span>
			)}
		</div>
		{showLabel && badge && (
			<span
				className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
					active ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
				}`}
			>
				{badge}
			</span>
		)}
	</button>
)

const SeniorStatusBadge = ({ status }: { status: OrderStatus }) => {
	const configs: Record<
		OrderStatus,
		{ bg: string; dot: string; text: string }
	> = {
		PENDING: {
			bg: 'bg-slate-100',
			dot: 'bg-slate-400',
			text: 'text-slate-700',
		},
		PROCESSING: {
			bg: 'bg-amber-50',
			dot: 'bg-amber-400',
			text: 'text-amber-700',
		},
		SHIPPED: {
			bg: 'bg-indigo-50',
			dot: 'bg-indigo-400',
			text: 'text-indigo-700',
		},
		DELIVERED: {
			bg: 'bg-emerald-50',
			dot: 'bg-emerald-400',
			text: 'text-emerald-700',
		},
	}

	const config = configs[status] || configs.PENDING

	return (
		<div
			className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg ${config.bg}`}
		>
			<div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
			<span
				className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}
			>
				{status}
			</span>
		</div>
	)
}

export default FashionDashboard
