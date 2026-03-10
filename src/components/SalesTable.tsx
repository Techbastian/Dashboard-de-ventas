import { useState } from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';
import { VentaHistorica } from '../types';
import { format } from 'date-fns';

interface SalesTableProps {
  data: VentaHistorica[];
  onEdit: (record: VentaHistorica) => void;
  onDelete: (id: number) => void;
}

export default function SalesTable({ data, onEdit, onDelete }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => 
    row.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.no_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.concepto_documento && row.concepto_documento.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)] overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#111111]">Histórico de Ventas</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cliente, documento..." 
            className="pl-10 pr-4 py-2 bg-[#F5F5F5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C4B5F4] w-full sm:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-[#F5F5F5] text-[#555555] text-sm font-medium">
              <th className="p-4 pl-6">Cliente</th>
              <th className="p-4">No. Doc</th>
              <th className="p-4">Concepto</th>
              <th className="p-4">Unidad Negocio</th>
              <th className="p-4">Fecha</th>
              <th className="p-4 text-right">Subtotal</th>
              <th className="p-4 text-right">IVA</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4">Tipo</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredData.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 pl-6 font-medium text-[#111111]">{row.nombre_cliente}</td>
                <td className="p-4 text-[#555555]">{row.no_documento}</td>
                <td className="p-4 text-[#555555] max-w-[200px] truncate" title={row.concepto_documento}>
                  {row.concepto_documento}
                </td>
                <td className="p-4 text-[#555555]">{row.unidad_negocio}</td>
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
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-[#555555]">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
