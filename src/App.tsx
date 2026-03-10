import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Menu, Filter } from 'lucide-react';
import { supabase } from './lib/supabase';
import { VentaHistorica } from './types';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import ClientTable from './components/ClientTable';
import ClientDetail from './components/ClientDetail';
import RecordModal from './components/RecordModal';
import SalesTable from './components/SalesTable';
import DashboardCharts from './components/DashboardCharts';

export default function App() {
  const [data, setData] = useState<VentaHistorica[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'historico' | 'clientes'>('dashboard');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VentaHistorica | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [selectedYear, setSelectedYear] = useState<string>('Todos');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: records, error } = await supabase
        .from('ventas_historicas')
        .select('*')
        .order('fecha_factura', { ascending: false });

      if (error) throw error;
      setData(records || []);
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (recordData: Partial<VentaHistorica>) => {
    try {
      if (editingRecord) {
        const { error } = await supabase
          .from('ventas_historicas')
          .update(recordData)
          .eq('id', editingRecord.id);
        if (error) throw error;
        toast.success('Registro actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('ventas_historicas')
          .insert([recordData]);
        if (error) throw error;
        toast.success('Registro creado exitosamente');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('ventas_historicas')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Registro eliminado');
      fetchData();
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    }
  };

  const openNewModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const openEditModal = (record: VentaHistorica) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: 'dashboard' | 'historico' | 'clientes') => {
    setCurrentView(view);
    setSelectedClient(null);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const years = Array.from(new Set(data.map(d => d.año))).sort((a, b) => b - a);
  const filteredData = selectedYear === 'Todos' 
    ? data 
    : data.filter(d => d.año.toString() === selectedYear);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 w-64 border-r border-gray-100 bg-white shadow-2xl lg:shadow-none`}>
        <Sidebar 
          currentView={currentView}
          onViewChange={handleViewChange}
          onNewRecord={openNewModal} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </div>
      
      {/* Main Content */}
      <main className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'} w-full`}>
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="relative mb-8 lg:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 bg-white rounded-xl shadow-sm text-[#111111] hover:bg-gray-50 transition-colors border border-gray-100 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center justify-center bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100">
                  <img 
                    src="https://upkvrgncduvxzjvtxbpv.supabase.co/storage/v1/object/public/Imagenes%20Disruptia/Logo%20disruptia_BN_sinfondo.png" 
                    alt="Disruptia Logo" 
                    className="h-8 sm:h-12 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
                    {currentView === 'dashboard' && 'Dashboard de Ventas'}
                    {currentView === 'historico' && 'Histórico de Ventas'}
                    {currentView === 'clientes' && 'Directorio de Clientes'}
                  </h1>
                  <p className="text-[#555555] text-sm sm:text-base mt-1">
                    {currentView === 'dashboard' && 'Métricas y gráficos de facturación'}
                    {currentView === 'historico' && 'Registro detallado de todas las transacciones'}
                    {currentView === 'clientes' && 'Consolidado de clientes y facturación'}
                  </p>
                </div>
              </div>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 self-start sm:self-auto shrink-0">
              <Filter size={18} className="text-[#5046E5]" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-[#111111] font-medium focus:outline-none text-sm cursor-pointer"
              >
                <option value="Todos">Todos los años</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046E5]"></div>
            </div>
          ) : (
            <div className="space-y-8 lg:space-y-10 pb-20">
              {currentView === 'dashboard' && (
                <>
                  <KPICards data={filteredData} />
                  <DashboardCharts data={filteredData} />
                </>
              )}
              
              {currentView === 'historico' && (
                <SalesTable 
                  data={filteredData} 
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              )}

              {currentView === 'clientes' && (
                <>
                  {selectedClient ? (
                    <ClientDetail 
                      clientName={selectedClient} 
                      data={filteredData} 
                      onBack={() => setSelectedClient(null)} 
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <ClientTable 
                      data={filteredData} 
                      onSelectClient={setSelectedClient} 
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        initialData={editingRecord}
      />
    </div>
  );
}
