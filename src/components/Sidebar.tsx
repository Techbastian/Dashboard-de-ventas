import { LayoutDashboard, Settings, Users, Plus, X } from 'lucide-react';

interface SidebarProps {
  onNewRecord: () => void;
  onClose?: () => void;
}

export default function Sidebar({ onNewRecord, onClose }: SidebarProps) {
  return (
    <div className="w-64 bg-white h-full flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <div className="inline-block border-2 border-[#111111] rounded-full px-4 py-1.5">
          <span className="font-black text-lg tracking-wider text-[#111111]">DISRUPTIA</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="px-4 mb-6">
        <button 
          onClick={onNewRecord}
          className="w-full bg-[#5046E5] hover:bg-[#3D35D0] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/30"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Registro
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#F5F5F5] text-[#111111] rounded-xl font-bold">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#555555] hover:bg-gray-50 rounded-xl font-medium transition-colors">
          <Users size={20} />
          <span>Clientes</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#555555] hover:bg-gray-50 rounded-xl font-medium transition-colors">
          <Settings size={20} />
          <span>Configuración</span>
        </a>
      </nav>
    </div>
  );
}
