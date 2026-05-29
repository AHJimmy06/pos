import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Percent,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMINISTRATOR'],
  },
  {
    title: 'Punto de Venta',
    path: '/pos',
    icon: ShoppingCart,
    roles: ['ADMINISTRATOR', 'SELLER'],
  },
  {
    title: 'Productos',
    path: '/products',
    icon: Package,
    roles: ['ADMINISTRATOR'],
  },
  {
    title: 'Clientes',
    path: '/clients',
    icon: Users,
    roles: ['ADMINISTRATOR'],
  },
  {
    title: 'Usuarios',
    path: '/users',
    icon: Users,
    roles: ['ADMINISTRATOR'],
  },
  {
    title: 'Impuestos',
    path: '/taxes',
    icon: Percent,
    roles: ['ADMINISTRATOR'],
  },
  {
    title: 'Facturas',
    path: '/invoices',
    icon: FileText,
    roles: ['ADMINISTRATOR'],
  },
  {
    title: 'Configuración',
    path: '/settings',
    icon: Settings,
    roles: ['ADMINISTRATOR'],
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 flex flex-col h-screen bg-card border-r border-border sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <ShoppingCart className="size-5" />
          </div>
          <span className="font-black tracking-tighter uppercase text-foreground">Gentleman POS</span>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 mx-4 my-4 bg-muted/50 rounded-xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-primary font-bold">{user?.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-foreground">{user?.fullName}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
              {user?.role === 'ADMINISTRATOR' ? 'Admin' : 'Vendedor'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="size-4" />
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            <ChevronRight className={cn(
              "size-3 transition-transform duration-200",
              "group-hover:translate-x-0.5"
            )} />
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 size-4" />
          <span className="text-sm font-bold uppercase tracking-tight">Cerrar Sesión</span>
        </Button>
      </div>
    </aside>
  );
};
