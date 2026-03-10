import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { VentaHistorica } from '../types';

interface DashboardChartsProps {
  data: VentaHistorica[];
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORS = ['#5046E5', '#C4B5F4', '#F5A623', '#F28B82', '#3B3DBF'];

export default function DashboardCharts({ data }: DashboardChartsProps) {
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 1. Process data for Area Chart (Sales over time by month)
  const monthlyData = useMemo(() => {
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      name: MONTHS[i],
      ventas: 0,
      notasCredito: 0,
      neto: 0
    }));

    data.forEach(record => {
      const monthIndex = record.mes - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        if (record.tipo_documento === 'Factura') {
          monthlyTotals[monthIndex].ventas += Number(record.total);
          monthlyTotals[monthIndex].neto += Number(record.total);
        } else if (record.tipo_documento === 'Nota Crédito') {
          monthlyTotals[monthIndex].notasCredito += Number(record.total);
          monthlyTotals[monthIndex].neto -= Number(record.total);
        }
      }
    });

    return monthlyTotals;
  }, [data]);

  // 2. Process data for Pie Chart (Segments)
  const segmentData = useMemo(() => {
    const segments: Record<string, number> = {};
    
    data.forEach(record => {
      const segment = record.segmento || 'Otro';
      if (!segments[segment]) segments[segment] = 0;
      
      // Calculate net value
      if (record.tipo_documento === 'Factura') {
        segments[segment] += Number(record.total);
      } else if (record.tipo_documento === 'Nota Crédito') {
        segments[segment] -= Number(record.total);
      }
    });

    return Object.entries(segments)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // 3. Process data for Bar Chart (Business Units)
  const unitData = useMemo(() => {
    const units: Record<string, number> = {};
    
    data.forEach(record => {
      const unit = record.unidad_negocio || 'Otra';
      if (!units[unit]) units[unit] = 0;
      
      // Calculate net value
      if (record.tipo_documento === 'Factura') {
        units[unit] += Number(record.total);
      } else if (record.tipo_documento === 'Nota Crédito') {
        units[unit] -= Number(record.total);
      }
    });

    return Object.entries(units)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Main Area Chart */}
      <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)]">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#111111]">Evolución de Ventas (Neto)</h3>
          <p className="text-sm text-[#555555]">Comportamiento de la facturación a lo largo del tiempo</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5046E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5046E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={formatCurrency}
                dx={-10}
              />
              <Tooltip 
                formatter={(value: number) => [formatTooltipCurrency(value), 'Ventas Netas']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="neto" 
                stroke="#5046E5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNeto)" 
                activeDot={{ r: 6, fill: '#5046E5', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Segments */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#111111]">Distribución por Segmento</h3>
            <p className="text-sm text-[#555555]">Ventas netas según el modelo de negocio (B2B, B2C, etc.)</p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {segmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatTooltipCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No hay datos suficientes</p>
            )}
          </div>
        </div>

        {/* Bar Chart - Business Units */}
        <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_20px_rgba(80,70,229,0.10)]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#111111]">Ventas por Unidad de Negocio</h3>
            <p className="text-sm text-[#555555]">Rendimiento de las diferentes líneas de servicio</p>
          </div>
          <div className="h-[300px] w-full">
            {unitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#111111', fontSize: 12, fontWeight: 500 }}
                    width={120}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatTooltipCurrency(value), 'Ventas Netas']}
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#C4B5F4" radius={[0, 6, 6, 0]} barSize={32}>
                    {unitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No hay datos suficientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
