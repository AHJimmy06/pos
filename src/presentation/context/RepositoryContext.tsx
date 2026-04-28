import React, { createContext, useContext } from 'react';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { TaxRepository } from '../../domain/repositories/tax.repository';
import { InvoiceRepository } from '../../domain/repositories/invoice.repository';

interface RepositoryContextProps {
  clientRepository: ClientRepository;
  productRepository: ProductRepository;
  taxRepository: TaxRepository;
  invoiceRepository: InvoiceRepository;
}

const RepositoryContext = createContext<RepositoryContextProps | null>(null);

/**
 * Hook personalizado para acceder a los repositorios desde cualquier parte de la app.
 * ¡Cumple con el Dependency Inversion Principle!
 */
export const useRepositories = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories debe usarse dentro de un RepositoryProvider');
  }
  return context;
};

export const RepositoryProvider: React.FC<{ 
  repositories: RepositoryContextProps; 
  children: React.ReactNode 
}> = ({ repositories, children }) => {
  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};
