import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
				<div className="flex items-center justify-between p-6 border-b border-slate-100">
					<h3 className="text-xl font-bold text-slate-900">{title}</h3>
					<button 
						type="button"
						title="Close Modal"
						onClick={onClose} 
						className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
					>
						<X size={20} className="text-slate-400" />
					</button>
				</div>
				<div className="p-8">
					{children}
				</div>
			</div>
		</div>
	);
};
