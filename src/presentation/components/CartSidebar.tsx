import React, { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePOSStore } from '../store/usePOSStore';
import { useInvoices } from '../hooks/usePOS';
import { useProducts } from '../hooks/useProducts';
import { useApplication } from '../context/ApplicationContext';
import { ShoppingCart, Trash2, Receipt, Plus, Minus, CreditCard, FileText, ShoppingBasket } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { InvoicePDF } from './InvoicePDF';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

interface CartSidebarProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onSuccess, onError }) => {
  const queryClient = useQueryClient();
  const { currentInvoice, selectedClient, setInvoice, clear } = usePOSStore();
  const { useCases } = useApplication();
  const { invoices, isCreating } = useInvoices();
  const { products } = useProducts();
  const componentRef = useRef<HTMLDivElement>(null);

  const nextInvoiceNumber = invoices.length > 0
    ? Math.max(...invoices.map(i => i.id || 0)) + 1
    : 1;

  const formattedInvoiceNumber = nextInvoiceNumber.toString().padStart(6, '0');

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Factura_${formattedInvoiceNumber}`,
  });

  const handleUpdateQuantity = (productId: number, delta: number, name: string) => {
    if (!currentInvoice) return;
    const product = products.find(p => p.id === productId);
    const stock = product?.stock.value ?? 0;

    try {
      const updated = useCases.updateQuantity.execute(currentInvoice, productId, delta, stock, name);
      setInvoice(updated);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRemoveItem = (productId: number) => {
    if (!currentInvoice) return;
    const updated = useCases.removeItem.execute(currentInvoice, productId);
    setInvoice(updated);
  };

  const handleFinalize = async () => {
    if (!currentInvoice) return;
    try {
      await useCases.finalizeInvoice.execute(currentInvoice);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onSuccess?.();
      clear();
    } catch (error: any) {
      onError?.('Error: ' + error.message);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-100px)] sticky top-4 shadow-xl border-border/50 overflow-hidden">
      <div className="hidden">
        {currentInvoice && selectedClient && (
          <InvoicePDF
            ref={componentRef}
            invoice={currentInvoice}
            client={selectedClient}
            invoiceNumber={formattedInvoiceNumber}
          />
        )}
      </div>

      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <ShoppingCart className="size-4" />
            </div>
            <CardTitle className="text-lg font-black tracking-tight">Carrito</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono font-bold">
              #{formattedInvoiceNumber}
              <span className="ml-2 text-muted-foreground font-normal">
                {new Date().toLocaleDateString('es-AR')}
              </span>
            </Badge>
        </div>

        {selectedClient ? (
          <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border shadow-sm">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Receipt className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Cliente Activo</p>
              <p className="text-xs font-bold truncate">{selectedClient.fullName}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 border-2 border-dashed border-muted rounded-xl text-center">
            <p className="text-[10px] font-medium text-muted-foreground italic">Seleccione un cliente</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {!currentInvoice || currentInvoice.details.length === 0 ? (
            <EmptyState
              icon={<ShoppingBasket className="size-6" />}
              title="Esperando Items"
              description="Seleccioná un cliente y agregá productos"
              className="h-full min-h-[200px]"
            />
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                <tr className="text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50">
                  <th className="pl-5 py-3 font-black">Producto</th>
                  <th className="px-2 py-3 text-center font-black">Cant.</th>
                  <th className="px-2 py-3 text-right font-black">P.Unit</th>
                  <th className="px-2 py-3 text-center font-black">IVA</th>
                  <th className="pr-5 py-3 text-right font-black w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {currentInvoice.details.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  const isAtMaxStock = item.quantity >= (product?.stock.value || 0);

                  return (
                    <tr key={item.productId} className="group hover:bg-muted/50 transition-colors">
                      <td className="pl-5 py-3">
                        <p className="text-xs font-bold line-clamp-1">{item.productName}</p>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center border rounded-lg overflow-hidden h-7 scale-90 bg-background">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleUpdateQuantity(item.productId, -1, item.productName)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="text-xs font-black w-5 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isAtMaxStock}
                            onClick={() => handleUpdateQuantity(item.productId, 1, item.productName)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.unitPrice.toString()}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {item.taxes.length > 0
                            ? `${item.taxes.reduce((sum, t) => sum + t.rate, 0)}%`
                            : '-'}
                        </span>
                      </td>
                      <td className="pr-5 py-3 text-right relative w-28">
                        <span className="text-xs font-black group-hover:opacity-0 transition-opacity block">
                          {item.total.toString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex-col p-6 bg-background border-t gap-4">
        <div className="w-full space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground uppercase tracking-tighter text-[9px] font-bold">Subtotal</span>
            <span className="font-bold">{currentInvoice?.subtotal.toString() || '$0.00'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground uppercase tracking-tighter text-[9px] font-bold">IVA</span>
            <span className="font-bold">{currentInvoice?.taxTotal.toString() || '$0.00'}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">Total</p>
              <h3 className="text-2xl font-black tracking-tighter">
                {currentInvoice?.total.toString() || '$0.00'}
              </h3>
            </div>
            {currentInvoice && currentInvoice.details.length > 0 && selectedClient && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-[10px] font-bold"
              >
                <FileText className="size-3.5" />
                PDF
              </Button>
            )}
          </div>
        </div>

        <Button
          className="w-full h-12 text-sm font-bold gap-2"
          disabled={!currentInvoice || currentInvoice.details.length === 0 || isCreating}
          onClick={handleFinalize}
        >
          {isCreating ? (
            <div className="size-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard className="size-4" />
              COBRAR
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};