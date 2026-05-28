import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Productos</h1>
          <p className="text-muted-foreground">Administra tu inventario y precios</p>
        </div>
        <Button className="font-bold uppercase tracking-tight">
          <Plus className="mr-2 size-4" /> Nuevo Producto
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Listado de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl gap-4">
            <Package className="size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground font-medium italic">Tabla de productos (Conectando a API...)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
