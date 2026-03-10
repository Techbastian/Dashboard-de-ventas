import { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { VentaHistorica } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VentaHistorica>) => void;
  initialData?: VentaHistorica | null;
}

export default function RecordModal({ isOpen, onClose, onSave, initialData }: RecordModalProps) {
  const [uploadMode, setUploadMode] = useState<'manual' | 'pdf'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);

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
    setUploadMode('manual');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const base64Data = base64String.split(',')[1];
      const mimeType = file.type;

      // @ts-ignore - Vite define replaces this
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key de Gemini no configurada");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          "Extrae la información de esta factura. Si no encuentras un dato, déjalo vacío o en 0. Para el NIT, extrae solo los números sin dígito de verificación ni puntos. Devuelve los valores numéricos como números, no como strings."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nombre_cliente: { type: Type.STRING },
              nit_cliente: { type: Type.NUMBER },
              no_documento: { type: Type.STRING },
              concepto_documento: { type: Type.STRING },
              fecha_factura: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
              subtotal: { type: Type.NUMBER },
              iva: { type: Type.NUMBER },
              total: { type: Type.NUMBER }
            }
          }
        }
      });

      if (response.text) {
        const extracted = JSON.parse(response.text);
        
        setFormData(prev => {
          const newData = { ...prev, ...extracted };
          
          // Ensure total is calculated if missing but subtotal/iva exist
          if (!newData.total && (newData.subtotal || newData.iva)) {
            newData.total = Number(newData.subtotal || 0) + Number(newData.iva || 0);
          }

          if (extracted.fecha_factura) {
            try {
              const [year, month] = extracted.fecha_factura.split('-');
              if (year && month) {
                newData.mes = parseInt(month, 10);
                newData.año = parseInt(year, 10);
              }
            } catch (e) {}
          }
          return newData;
        });
        
        toast.success('Datos extraídos correctamente. Por favor verifica la información.');
        setUploadMode('manual');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Error al procesar el documento: ' + error.message);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
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
          {!initialData && (
            <div className="flex border-b border-gray-100 mb-6">
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${uploadMode === 'manual' ? 'border-[#5046E5] text-[#5046E5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setUploadMode('manual')}
              >
                Ingreso Manual
              </button>
              <button
                type="button"
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${uploadMode === 'pdf' ? 'border-[#5046E5] text-[#5046E5]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setUploadMode('pdf')}
              >
                Subir Factura (PDF/Img)
              </button>
            </div>
          )}

          {uploadMode === 'pdf' ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#C4B5F4] rounded-[16px] bg-gray-50">
              {isProcessing ? (
                <div className="flex flex-col items-center text-[#5046E5]">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-medium">Analizando documento con IA...</p>
                  <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-16 h-16 text-[#C4B5F4] mb-4" />
                  <p className="text-[#111111] font-medium mb-2">Sube tu factura en PDF o Imagen</p>
                  <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
                    La Inteligencia Artificial extraerá automáticamente los datos para llenar el formulario.
                  </p>
                  <label className="cursor-pointer bg-[#5046E5] hover:bg-[#3D35D0] text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg shadow-indigo-500/30">
                    Seleccionar Archivo
                    <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
                  </label>
                </>
              )}
            </div>
          ) : (
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
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 shrink-0 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-7 py-3 rounded-full border-2 border-[#111111] text-[#111111] font-bold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          {uploadMode === 'manual' && (
            <button 
              type="submit" 
              form="record-form"
              className="px-7 py-3 rounded-full bg-[#5046E5] text-white font-bold hover:bg-[#3D35D0] transition-colors"
            >
              Guardar Registro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
