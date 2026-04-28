import React, { createContext, useContext, useMemo } from 'react';
import * as repos from '../../infrastructure/repositories';
import { AddItemToInvoiceUseCase } from '../../application/use-cases/add-item-to-invoice.use-case';
import { UpdateItemQuantityUseCase } from '../../application/use-cases/update-item-quantity.use-case';
import { RemoveItemFromInvoiceUseCase } from '../../application/use-cases/remove-item-from-invoice.use-case';
import { FinalizeInvoiceUseCase } from '../../application/use-cases/finalize-invoice.use-case';

interface ApplicationContextProps {
  // Repositorios
  repositories: typeof repos;
  // Casos de Uso
  useCases: {
    addItem: AddItemToInvoiceUseCase;
    updateQuantity: UpdateItemQuantityUseCase;
    removeItem: RemoveItemFromInvoiceUseCase;
    finalizeInvoice: FinalizeInvoiceUseCase;
  };
}

const ApplicationContext = createContext<ApplicationContextProps | null>(null);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usamos useMemo para que las instancias se creen una sola vez
  const value = useMemo(() => ({
    repositories: repos,
    useCases: {
      addItem: new AddItemToInvoiceUseCase(),
      updateQuantity: new UpdateItemQuantityUseCase(),
      removeItem: new RemoveItemFromInvoiceUseCase(),
      finalizeInvoice: new FinalizeInvoiceUseCase(repos.invoiceRepository),
    }
  }), []);

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error('useApplication debe usarse dentro de un ApplicationProvider');
  return context;
};
