export interface VentaHistorica {
  id: number;
  nombre_cliente: string;
  nit_cliente: number;
  no_documento: string;
  concepto_documento: string;
  centro_costos: number;
  segmento: 'B2B' | 'B2G' | 'B2C';
  unidad_negocio: 'Disruptia Tech' | 'Disruptia Learning' | 'Talento Adaptativo' | 'Grant';
  producto: string;
  fecha_factura: string;
  mes: number;
  año: number;
  subtotal: number;
  iva: number;
  total: number;
  tipo_documento: 'Factura' | 'Nota Crédito';
  created_at: string;
}

export interface ClientSummary {
  nombre_cliente: string;
  nit_cliente: number;
  segmento: string;
  total_facturado: number;
  notas_credito: number;
  neto: number;
  num_registros: number;
}
