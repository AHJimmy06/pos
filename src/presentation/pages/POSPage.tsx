import React from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { ClientSelector } from '../components/ClientSelector';
import { CartSidebar } from '../components/CartSidebar';
import { InvoiceHistory } from '../components/InvoiceHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Warehouse } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export const POSPage: React.FC = () => {
  const { toast, showToast, hideToast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Page Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground">
              <Warehouse className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Punto de Venta</h1>
              <p className="text-xs text-muted-foreground">Sistema de facturación y gestión</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LADO IZQUIERDO: SELECCIÓN + HISTORIAL (7 Columnas) */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="uppercase tracking-tight text-xs font-black text-muted-foreground">
                  1. Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientSelector />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="uppercase tracking-tight text-xs font-black text-muted-foreground">
                  2. Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductGrid />
              </CardContent>
            </Card>

            <InvoiceHistory />
          </div>

          {/* LADO DERECHO: FACTURA (5 Columnas) */}
          <div className="col-span-12 lg:col-span-5 h-full">
            <CartSidebar
              onSuccess={() => showToast('¡Venta realizada con éxito!', 'success')}
              onError={(msg) => showToast(msg, 'error')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};