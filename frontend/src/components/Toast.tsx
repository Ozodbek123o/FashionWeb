import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import React, { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
	message: string
	type: ToastType
	onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
	useEffect(() => {
		const timer = setTimeout(onClose, 5000)
		return () => clearTimeout(timer)
	}, [onClose])

	const icons = {
		success: <CheckCircle2 className='text-emerald-500' size={20} />,
		error: <AlertCircle className='text-rose-500' size={20} />,
		info: <Info className='text-blue-500' size={20} />,
	}

	const bgs = {
		success: 'bg-emerald-50 border-emerald-100',
		error: 'bg-rose-50 border-rose-100',
		info: 'bg-blue-50 border-blue-100',
	}

	return (
		<div
			className={`fixed bottom-8 right-8 flex items-center space-x-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 duration-300 z-[100] ${bgs[type]}`}
		>
			{icons[type]}
			<p className='text-sm font-bold text-slate-800'>{message}</p>
			<button
				type='button'
				title='Close Notification'
				onClick={onClose}
				className='text-slate-400 hover:text-slate-600 transition-colors'
			>
				<X size={18} />
			</button>
		</div>
	)
}
