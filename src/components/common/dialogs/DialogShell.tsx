import { X } from 'lucide-react';

interface DialogShellProps {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

export function DialogShell({ isOpen, onClose, icon, iconBg, title, children }: DialogShellProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
              {icon}
            </div>
            <h3 className="font-semibold text-[#1A1D2E]">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
