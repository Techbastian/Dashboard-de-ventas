import { ArrowLeft, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { VentaHistorica } from '../types';
import { format } from 'date-fns';

interface ClientDetailProps {
  clientName: string;
  data: VentaHistorica[];
  onBack: () => void;
  onEdit: (record: VentaHistorica) => void;
  onDelete: (id: number) => void;
}

export default function ClientDetail({ clientName, data, onBack, onEdit, onDelete }: ClientDetailProps) {
  const clientData = data.filter(d => d.nombre_cliente === clientName);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const totalFacturado = clientData
    .filter(d => d.tipo_documento === 'Factura')
    .reduce((sum, d) => sum + Number(d.total), 0);
    
  const totalNotasCredito = clientData
    .filter(d => d.tipo_documento === 'Nota Crédito')
    .reduce((sum, d) => sum + Number(d.total), 0);
    
  const netoTotal = clientData.reduce((sum, d) => sum + Number(d.total), 0);

  return (
    <div className="space-y-6">
      {/* Client Summary Cards */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)] p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#555555] shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">{clientName}</h2>
            <p className="text-xs sm:text-sm text-[#555555]">Resumen del cliente en el periodo seleccionado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-[#555555] font-medium">Total Facturado</p>
              <p className="text-lg sm:text-xl font-bold text-[#111111]">{formatCurrency(totalFacturado)}</p>
            </div>
          </div>
          
          <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFEBEE] text-[#C62828] flex items-center justify-center shrink-0">
              <TrendingDown size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-[#555555] font-medium">Notas Crédito</p>
              <p className="text-lg sm:text-xl font-bold text-[#F28B82]">{formatCurrency(totalNotasCredito)}</p>
            </div>
          </div>

          <div className="bg-[#5046E5] rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-white shadow-lg shadow-indigo-500/20">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <DollarSign size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/80 font-medium">Neto Total</p>
              <p className="text-xl sm:text-2xl font-black">{formatCurrency(netoTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Records Table */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#111111]">Historial de Registros</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#F5F5F5] text-[#555555] text-sm font-medium">
                <th className="p-4 pl-6">No. Doc</th>
                <th className="p-4">Concepto</th>
                <th className="p-4">Unidad Negocio</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Fecha</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-right">IVA</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {clientData.length > 0 ? clientData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-[#111111]">{row.no_documento}</td>
                  <td className="p-4 text-[#555555] max-w-[200px] truncate" title={row.concepto_documento}>
                    {row.concepto_documento}
                  </td>
                  <td className="p-4 text-[#555555]">{row.unidad_negocio}</td>
                  <td className="p-4 text-[#555555]">{row.producto}</td>
                  <td className="p-4 text-[#555555]">{formatDate(row.fecha_factura)}</td>
                  <td className="p-4 text-right text-[#555555]">{formatCurrency(row.subtotal)}</td>
                  <td className="p-4 text-right text-[#555555]">{formatCurrency(row.iva)}</td>
                  <td className={`p-4 text-right font-bold ${row.tipo_documento === 'Nota Crédito' ? 'text-[#F28B82]' : 'text-[#111111]'}`}>
                    {formatCurrency(row.total)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.tipo_documento === 'Factura' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'
                    }`}>
                      {row.tipo_documento}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit(row)}
                        className="p-1.5 text-gray-400 hover:text-[#5046E5] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de eliminar este registro?')) {
                            onDelete(row.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#F28B82] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#555555]">
                    No hay registros para este cliente en el año seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
