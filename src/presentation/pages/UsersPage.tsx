import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, UserPlus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const UsersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de personal y permisos</p>
        </div>
        <Button className="font-bold uppercase tracking-tight">
          <UserPlus className="mr-2 size-4" /> Registrar Usuario
        </Button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4 text-amber-700">
        <div className="bg-amber-500/20 p-2 rounded-lg">
          <ShieldAlert className="size-5" />
        </div>
        <div>
          <p className="text-sm font-bold">Control de Bloqueos</p>
          <p className="text-xs font-medium opacity-80">Recuerda que los usuarios se bloquean tras 3 intentos fallidos. Puedes desbloquearlos desde la tabla.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Personal del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl gap-4">
            <Users className="size-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground font-medium italic">Gestión de usuarios (Solo Administradores)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
