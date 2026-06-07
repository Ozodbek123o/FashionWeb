import { ArrowUpRight } from 'lucide-react'
import React from 'react'

interface StatCardProps {
	title: string
	value: string | number
	icon: React.ReactNode
	trend: string
	trendType?: 'positive' | 'negative' | 'neutral'
}

export const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	icon,
	trend,
	trendType = 'positive',
}) => (
	<div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group'>
		<div className='flex justify-between items-start mb-4'>
			<div className='p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors duration-300'>
				{icon}
			</div>
			<div
				className={`flex items-center text-xs font-bold ${
					trendType === 'positive'
						? 'text-emerald-500'
						: trendType === 'negative'
							? 'text-rose-500'
							: 'text-slate-400 dark:text-slate-500'
				}`}
			>
				<ArrowUpRight size={14} className='mr-1' />
				{trend}
			</div>
		</div>
		<h3 className='text-slate-500 dark:text-slate-400 text-sm font-medium tracking-tight'>
			{title}
		</h3>
		<p className='text-2xl font-bold text-slate-900 dark:text-white mt-1'>{value}</p>
	</div>
)
