import React, { useState, useRef } from 'react';
import { useInvoices } from '../hooks/usePOS';
import { useClients } from '../hooks/useClients';
import { invoiceRepository } from '../../infrastructure/repositories';
import { InvoicePDF } from './InvoicePDF';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useReactToPrint } from 'react-to-print';
import { Eye, Printer, X, Search } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const PAGE_SIZE = 5;

export const InvoiceHistory: React.FC = () => {
  const [searchId, setSearchId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { invoices, total, totalPages, isLoading } = useInvoices({
    page,
    limit: PAGE_SIZE,
    searchId,
  });

  const { clients } = useClients();

  const getClientName = (clientId: number | undefined) => {
    if (!clientId) return 'N/A';
    const client = clients.find(c => c.id === clientId);
    return client?.fullName || 'N/A';
  };

  const getClient = (clientId: number | undefined) => {
    if (!clientId) return null;
    return clients.find(c => c.id === clientId);
  };

  const handleViewInvoice = async (invoiceId: number) => {
    try {
      const invoice = await invoiceRepository.findById(invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
      }
    } catch (error) {
      alert('No se pudo cargar la factura');
    }
  };

  const handlePrintInvoice = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Factura_${selectedInvoice?.id?.toString().padStart(6, '0') || 'N/A'}`,
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="uppercase tracking-tight text-xs font-black text-muted-foreground">3. Historial de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Hidden InvoicePDF for printing */}
      <div className="hidden">
        {selectedInvoice && (
          <InvoicePDF
            ref={printRef}
            invoice={selectedInvoice}
            client={(getClient(selectedInvoice.clientId) || {
              id: selectedInvoice.clientId || 0,
              firstName: '',
              lastName: getClientName(selectedInvoice.clientId),
              email: 'N/A',
              phone: 'N/A',
              address: 'N/A'
            }) as any}
            invoiceNumber={selectedInvoice.id?.toString().padStart(6, '0') || 'N/A'}
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="uppercase tracking-tight text-xs font-black text-muted-foreground">3. Historial de Facturas</CardTitle>

          {/* Search bar - live search with debounce */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Buscar por ID de factura..."
              value={searchInput}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/[^0-9]/g, '');
                setSearchInput(value);

                // Debounce search
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                  const id = value.trim() ? parseInt(value, 10) : undefined;
                  setSearchId(isNaN(id!) ? undefined : id);
                  setPage(1);
                }, 150);
              }}
              className="pl-9"
            />
          </div>

          {/* Search info */}
          {searchId && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Buscando factura #{searchId}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => { setSearchId(undefined); setSearchInput(''); setPage(1); }}
                className="size-5"
              >
                <X className="size-3" />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<span className="text-2xl">📋</span>}
              title={searchId ? 'No se encontró la factura' : 'No hay facturas registradas'}
            />
          ) : (
            <>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 cursor-pointer transition-colors"
                    onClick={() => inv.id && handleViewInvoice(inv.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono font-bold text-xs">
                          #{inv.id?.toString().padStart(6, '0') || 'N/A'}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">{getClientName(inv.clientId)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('es-AR') : 'Sin fecha'}</span>
                        <span>•</span>
                        <span>{inv.details?.length || 0} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="font-black text-primary text-sm">{inv.total?.toString() || '$0.00'}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => { e.stopPropagation(); inv.id && handleViewInvoice(inv.id); }}
                          title="Ver detalles"
                        >
                          <Eye className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => { e.stopPropagation(); inv.id && handleViewInvoice(inv.id); }}
                          title="Imprimir"
                        >
                          <Printer className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {total} facturas • pág. {page}/{totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      ◀
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      ▶
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal - using shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono font-bold">
              Factura #{selectedInvoice?.id?.toString().padStart(6, '0') || 'N/A'}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice meta info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-bold">{getClientName(selectedInvoice.clientId)}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-bold">
                    {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleString('es-AR') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs">{selectedInvoice.transactionId || 'N/A'}</span>
              </div>

              {/* Items table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-3 py-2 text-xs font-black text-muted-foreground uppercase">Producto</th>
                      <th className="px-2 py-2 text-center text-xs font-black text-muted-foreground uppercase">Cant.</th>
                      <th className="px-3 py-2 text-right text-xs font-black text-muted-foreground uppercase">Precio</th>
                      <th className="px-3 py-2 text-right text-xs font-black text-muted-foreground uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {selectedInvoice.details?.length > 0 ? (
                      selectedInvoice.details.map((d: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <p className="font-bold text-foreground">{d.productName}</p>
                            <p className="text-xs text-muted-foreground">{d.unitPrice?.toString()} c/u</p>
                          </td>
                          <td className="px-2 py-2 text-center">{d.quantity}</td>
                          <td className="px-3 py-2 text-right">{d.unitPrice?.toString()}</td>
                          <td className="px-3 py-2 text-right font-bold">{d.total?.toString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-center text-muted-foreground">Sin detalles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-bold">{selectedInvoice.subtotal?.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos:</span>
                  <span className="font-bold text-primary">{selectedInvoice.taxTotal?.toString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-black uppercase text-xs">Total:</span>
                  <span className="font-black text-primary text-lg">{selectedInvoice.total?.toString()}</span>
                </div>
              </div>

              {/* Actions */}
              <DialogFooter className="gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handlePrintInvoice}
                >
                  <Printer className="size-4" /> Imprimir
                </Button>
                <Button
                  className="flex-1"
                  onClick={closeModal}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};