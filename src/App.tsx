import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { POSPage } from './presentation/pages/POSPage';
import { ApplicationProvider } from './presentation/context/ApplicationContext';
import { ShoppingCart } from 'lucide-react';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <ApplicationProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-muted/20">
          <nav className="bg-primary text-primary-foreground p-4 shadow-md mb-6">
            <div className="container mx-auto flex items-center gap-2">
              <ShoppingCart className="size-6" />
              <h1 className="text-xl font-black tracking-tight uppercase">Gentleman POS</h1>
            </div>
          </nav>
          <main className="container mx-auto px-4 pb-8">
            <POSPage />
          </main>
        </div>
      </QueryClientProvider>
    </ApplicationProvider>
  );
}

export default App;
