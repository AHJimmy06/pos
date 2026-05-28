import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Users, Receipt, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const stats = [
    { title: 'Ventas Hoy', value: '$12,450.00', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Productos', value: '142', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Clientes', value: '890', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { title: 'Facturas', value: '1,245', icon: Receipt, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del estado del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-xl">
              <p className="text-sm text-muted-foreground font-medium italic">Gráfico de ventas (Próximamente)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Top Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="size-8 bg-muted rounded flex items-center justify-center text-xs font-bold text-muted-foreground">#{item}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Producto Demo #{item}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">24 ventas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
