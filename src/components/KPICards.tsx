import { VentaHistorica } from '../types';

interface KPICardsProps {
  data: VentaHistorica[];
}

export default function KPICards({ data }: KPICardsProps) {
  const uniqueClients = new Set(data.map(d => d.nombre_cliente)).size;
  
  const totalFacturado = data
    .filter(d => d.tipo_documento === 'Factura')
    .reduce((sum, d) => sum + Number(d.total), 0);
    
  const totalNotasCredito = data
    .filter(d => d.tipo_documento === 'Nota Crédito')
    .reduce((sum, d) => sum + Number(d.total), 0);
    
  const netoTotal = data.reduce((sum, d) => sum + Number(d.total), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    { title: 'Clientes Únicos', value: uniqueClients.toString() },
    { title: 'Total Facturado', value: formatCurrency(totalFacturado) },
    { title: 'Notas Crédito', value: formatCurrency(totalNotasCredito) },
    { title: 'Neto Total', value: formatCurrency(netoTotal) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="bg-[#5046E5] rounded-[24px] p-6 text-white relative overflow-hidden shadow-[0_4px_20px_rgba(80,70,229,0.10)]"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`wave-${i}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 20 Q 10 10, 20 20 T 40 20" fill="none" stroke="white" strokeWidth="2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#wave-${i})`} />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-white/80 font-medium text-sm mb-2">{card.title}</h3>
            <p className="font-black text-3xl">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
