import { useState, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { VentaHistorica, ClientSummary } from '../types';

interface ClientTableProps {
  data: VentaHistorica[];
  onSelectClient: (clientName: string) => void;
}

export default function ClientTable({ data, onSelectClient }: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const summaries = useMemo(() => {
    const map = new Map<string, ClientSummary>();
    
    data.forEach(row => {
      const existing = map.get(row.nombre_cliente) || {
        nombre_cliente: row.nombre_cliente,
        nit_cliente: row.nit_cliente,
        segmento: row.segmento,
        total_facturado: 0,
        notas_credito: 0,
        neto: 0,
        num_registros: 0
      };

      const total = Number(row.total);
      if (row.tipo_documento === 'Factura') {
        existing.total_facturado += total;
      } else if (row.tipo_documento === 'Nota Crédito') {
        existing.notas_credito += total;
      }
      existing.neto += total;
      existing.num_registros += 1;

      map.set(row.nombre_cliente, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.neto - a.neto)
      .filter(s => s.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)] overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#111111]">Consolidado por Cliente</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="pl-10 pr-4 py-2 bg-[#F5F5F5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C4B5F4] w-full sm:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#F5F5F5] text-[#555555] text-sm font-medium">
              <th className="p-4 pl-6">Nombre Cliente</th>
              <th className="p-4">NIT</th>
              <th className="p-4">Segmento</th>
              <th className="p-4 text-right">Total Facturado</th>
              <th className="p-4 text-right">Notas Crédito</th>
              <th className="p-4 text-right">Neto</th>
              <th className="p-4 text-center">Registros</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {summaries.map((client, i) => (
              <tr 
                key={i} 
                onClick={() => onSelectClient(client.nombre_cliente)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <td className="p-4 pl-6 font-medium text-[#111111]">{client.nombre_cliente}</td>
                <td className="p-4 text-[#555555]">{client.nit_cliente}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-[#F5F5F5] rounded-full text-xs font-medium text-[#555555]">
                    {client.segmento}
                  </span>
                </td>
                <td className="p-4 text-right text-[#555555]">{formatCurrency(client.total_facturado)}</td>
                <td className="p-4 text-right text-[#F28B82]">{formatCurrency(client.notas_credito)}</td>
                <td className="p-4 text-right font-bold text-[#111111]">{formatCurrency(client.neto)}</td>
                <td className="p-4 text-center text-[#555555]">{client.num_registros}</td>
                <td className="p-4 text-right">
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-[#5046E5] transition-colors inline-block" />
                </td>
              </tr>
            ))}
            {summaries.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#555555]">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
