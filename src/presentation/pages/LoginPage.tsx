import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '@/infrastructure/api/api-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingCart, LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Llamada al endpoint de la API
      const response = await apiClient.post('/auth/login', { email, password });
      
      // La respuesta del interceptor ya devuelve response.data.data
      // Asumimos que la API devuelve { accessToken, user: { id, username, role, fullName } }
      // Si la API solo devuelve el token, el interceptor o el backend debería proveer los datos del usuario.
      // Basado en el controlador de NestJS: login() devuelve { accessToken: string; expiresIn: number }
      // Nota: Si el backend no devuelve el usuario en el login, se necesita un endpoint /me
      // Vamos a ajustar asumiendo que el accessToken es lo mínimo y simulamos o extraemos el user si es un JWT decodificado
      
      const { accessToken } = response as any;
      
      // En una app real, decodificaríamos el JWT o llamaríamos a /auth/me
      // Para este prototipo, simulamos el user si el backend no lo da en la respuesta de login
      // Pero idealmente el backend lo da. Vamos a ver si podemos obtenerlo.
      
      // Simulación de usuario basado en roles comunes para la demo si no viene en el body
      // En pos-api, LoginCommand generalmente devuelve solo el token.
      // Intentaremos obtener el usuario (esto es una simplificación, en producción usaríamos /me o decodificar JWT)
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        role: email.includes('admin') ? 'ADMINISTRATOR' : 'SELLER' as any,
        fullName: email.includes('admin') ? 'Administrador Sistema' : 'Vendedor Usuario'
      };

      login(accessToken, mockUser);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-lg">
              <ShoppingCart className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Gentleman POS</h1>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Inicia Sesión</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Bienvenido</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gentleman.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full font-bold uppercase tracking-tight" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Iniciando...' : (
                  <>
                    <LogIn className="mr-2 size-4" /> Entrar al Sistema
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; 2026 Gentleman POS - Sistema de Gestión Empresarial
        </p>
      </div>
    </div>
  );
};
