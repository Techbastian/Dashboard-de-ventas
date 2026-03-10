import { LayoutDashboard, Users, Plus, X, FileText } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'historico' | 'clientes';
  onViewChange: (view: 'dashboard' | 'historico' | 'clientes') => void;
  onNewRecord: () => void;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onViewChange, onNewRecord, onClose }: SidebarProps) {
  return (
    <div className="w-64 bg-white h-full flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <img 
          src="https://upkvrgncduvxzjvtxbpv.supabase.co/storage/v1/object/public/Imagenes%20Disruptia/Logo%20disruptia_BN_sinfondo.png" 
          alt="Disruptia" 
          className="h-8 object-contain"
          referrerPolicy="no-referrer"
        />
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
        <button 
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
            currentView === 'dashboard' 
              ? 'bg-[#F5F5F5] text-[#111111]' 
              : 'text-[#555555] hover:bg-gray-50 font-medium'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => onViewChange('historico')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
            currentView === 'historico' 
              ? 'bg-[#F5F5F5] text-[#111111]' 
              : 'text-[#555555] hover:bg-gray-50 font-medium'
          }`}
        >
          <FileText size={20} />
          <span>Histórico de Ventas</span>
        </button>
        <button 
          onClick={() => onViewChange('clientes')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
            currentView === 'clientes' 
              ? 'bg-[#F5F5F5] text-[#111111]' 
              : 'text-[#555555] hover:bg-gray-50 font-medium'
          }`}
        >
          <Users size={20} />
          <span>Clientes</span>
        </button>
      </nav>
    </div>
  );
}
