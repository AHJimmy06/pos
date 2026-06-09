import { forwardRef } from 'react';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Client } from '../../domain/entities/client.entity';

interface Props {
  invoice: Invoice;
  client: Client;
  invoiceNumber: string;
}

export const InvoicePDF = forwardRef<HTMLDivElement, Props>(({ invoice, client, invoiceNumber }, ref) => {
  const date = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div ref={ref} className="p-16 bg-white text-black font-serif print:p-8" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* HEADER DE LA FACTURA */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">GENTLEMAN POS</h1>
          <p className="text-sm">Av. Patrones de Software 123</p>
          <p className="text-sm">Buenos Aires, Argentina</p>
          <p className="text-sm">CUIT: 30-71234567-8</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-400">Factura</h2>
          <p className="text-xl font-mono font-bold">N° {invoiceNumber}</p>
          <p className="text-sm mt-2">{date}</p>
        </div>
      </div>

      {/* DATOS DEL CLIENTE */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="border border-black p-4 rounded">
          <p className="text-[10px] font-bold uppercase mb-2 border-b border-black">Facturar a:</p>
          <p className="font-bold text-lg">{client.fullName}</p>
          <p className="text-sm">{client.email.value}</p>
          <p className="text-sm">{client.phone}</p>
          <p className="text-sm">{client.address}</p>
        </div>
        <div className="flex flex-col justify-end text-right">
          <p className="text-sm"><span className="font-bold">Condición:</span> Venta de Contado</p>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-3 text-left uppercase text-xs">Descripción</th>
            <th className="py-3 text-center uppercase text-xs">Cant.</th>
            <th className="py-3 text-right uppercase text-xs">P. Unitario</th>
            <th className="py-3 text-center uppercase text-xs">IVA %</th>
            <th className="py-3 text-right uppercase text-xs">IVA</th>
            <th className="py-3 text-right uppercase text-xs">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {invoice.details.map((item, idx) => {
            const totalRate = item.taxes.reduce((sum, t) => sum + t.rate, 0);
            return (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-4 text-sm">{item.productName}</td>
                <td className="py-4 text-center text-sm">{item.quantity}</td>
                <td className="py-4 text-right text-sm">{item.unitPrice.toString()}</td>
                <td className="py-4 text-center text-xs">{totalRate > 0 ? `${totalRate}%` : '-'}</td>
                <td className="py-4 text-right text-sm">{item.taxTotal.toString()}</td>
                <td className="py-4 text-right text-sm font-bold">{item.total.toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* DESGLOSE FINAL */}
      {/*
        Los totales del header (Subtotal / Impuestos / TOTAL) se leen de los
        snapshots (`*Snapshot`) en lugar de calcularse desde los detalles.
        Razon: el SEED del back genera invoice_details con `pick()` random,
        asi que la suma de (unitPrice * quantity) por item NO coincide con
        el `subtotal_snapshot` del header. Los snapshots son la fuente de
        verdad para los totales de la factura (es lo que ve el usuario en
        el modal de detalles y lo que se persiste en la BDD).
        Los totales por item en la tabla de arriba se siguen calculando
        desde (unitPrice * quantity) porque cada item es independiente.
      */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal Neto:</span>
            <span>${invoice.subtotalSnapshot.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-black pb-2">
            <span>Impuestos Totales:</span>
            <span>${invoice.taxTotalSnapshot.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2">
            <span>TOTAL:</span>
            <span>${invoice.totalSnapshot.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FOOTER LEGAL */}
      <div className="mt-32 border-t border-gray-300 pt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
        <p>Gracias por su compra en Gentleman POS</p>
        <p className="mt-1">Documento no válido como factura fiscal en transacciones reales</p>
      </div>
    </div>
  );
});
