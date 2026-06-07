import { X } from 'lucide-react'
import React from 'react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
}) => {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300'>
			<div className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in slide-in-from-bottom-4 duration-500'>
				<div className='px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50'>
					<h2 className='text-xl font-black text-slate-900 dark:text-white tracking-tight'>
						{title}
					</h2>
					<button
						type='button'
						title='Close Modal'
						onClick={onClose}
						className='p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
					>
						<X size={20} />
					</button>
				</div>
				<div className='p-8 dark:text-slate-300'>{children}</div>
			</div>
		</div>
	)
}
