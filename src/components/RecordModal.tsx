import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { VentaHistorica } from '../types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VentaHistorica>) => void;
  initialData?: VentaHistorica | null;
}

export default function RecordModal({ isOpen, onClose, onSave, initialData }: RecordModalProps) {
  const [formData, setFormData] = useState<Partial<VentaHistorica>>({
    nombre_cliente: '',
    nit_cliente: 0,
    no_documento: '',
    concepto_documento: '',
    centro_costos: 0,
    segmento: 'B2B',
    unidad_negocio: 'Disruptia Tech',
    producto: '',
    fecha_factura: new Date().toISOString().split('T')[0],
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    subtotal: 0,
    iva: 0,
    total: 0,
    tipo_documento: 'Factura'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nombre_cliente: '',
        nit_cliente: 0,
        no_documento: '',
        concepto_documento: '',
        centro_costos: 0,
        segmento: 'B2B',
        unidad_negocio: 'Disruptia Tech',
        producto: '',
        fecha_factura: new Date().toISOString().split('T')[0],
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear(),
        subtotal: 0,
        iva: 0,
        total: 0,
        tipo_documento: 'Factura'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: parsedValue };
      
      // Auto-calculate total if subtotal or iva changes
      if (name === 'subtotal' || name === 'iva') {
        newData.total = Number(newData.subtotal || 0) + Number(newData.iva || 0);
      }
      
      // Auto-update mes and año if fecha_factura changes
      if (name === 'fecha_factura') {
        const date = new Date(value);
        newData.mes = date.getMonth() + 1;
        newData.año = date.getFullYear();
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-[#5046E5] p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Registro' : 'Nuevo Registro'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="record-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Nombre Cliente *</label>
              <input required type="text" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">NIT Cliente *</label>
              <input required type="number" name="nit_cliente" value={formData.nit_cliente || ''} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">No. Documento *</label>
              <input required type="text" name="no_documento" value={formData.no_documento} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Tipo de Documento *</label>
              <select required name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white">
                <option value="Factura">Factura</option>
                <option value="Nota Crédito">Nota Crédito</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#111111]">Concepto Documento</label>
              <input type="text" name="concepto_documento" value={formData.concepto_documento} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Segmento *</label>
              <select required name="segmento" value={formData.segmento} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white">
                <option value="B2B">B2B</option>
                <option value="B2G">B2G</option>
                <option value="B2C">B2C</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Unidad de Negocio *</label>
              <select required name="unidad_negocio" value={formData.unidad_negocio} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white">
                <option value="Disruptia Tech">Disruptia Tech</option>
                <option value="Disruptia Learning">Disruptia Learning</option>
                <option value="Talento Adaptativo">Talento Adaptativo</option>
                <option value="Grant">Grant</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Producto</label>
              <input type="text" name="producto" value={formData.producto} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Centro de Costos</label>
              <input type="number" name="centro_costos" value={formData.centro_costos || ''} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Fecha Factura *</label>
              <input required type="date" name="fecha_factura" value={formData.fecha_factura} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111111]">Mes</label>
                <input type="number" name="mes" value={formData.mes || ''} readOnly
                  className="w-full px-4 py-3 rounded-[12px] border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111111]">Año</label>
                <input type="number" name="año" value={formData.año || ''} readOnly
                  className="w-full px-4 py-3 rounded-[12px] border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">Subtotal *</label>
              <input required type="number" name="subtotal" value={formData.subtotal || ''} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111111]">IVA *</label>
              <input required type="number" name="iva" value={formData.iva || ''} onChange={handleChange}
                className="w-full px-4 py-3 rounded-[12px] border border-[#C4B5F4] focus:outline-none focus:ring-2 focus:ring-[#5046E5] bg-white" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[#111111]">Total</label>
              <input type="number" name="total" value={formData.total || ''} readOnly
                className="w-full px-4 py-3 rounded-[12px] border border-gray-200 bg-gray-50 text-gray-800 font-bold cursor-not-allowed" />
            </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 shrink-0 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-7 py-3 rounded-full border-2 border-[#111111] text-[#111111] font-bold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="record-form"
            className="px-7 py-3 rounded-full bg-[#5046E5] text-white font-bold hover:bg-[#3D35D0] transition-colors"
          >
            Guardar Registro
          </button>
        </div>
      </div>
    </div>
  );
}
