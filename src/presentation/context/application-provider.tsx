import { useMemo } from 'react';
import { ApplicationContext } from './application-context';
import * as repos from '../../infrastructure/repositories';
import { AddItemToInvoiceUseCase } from '../../application/use-cases/add-item-to-invoice.use-case';
import { UpdateItemQuantityUseCase } from '../../application/use-cases/update-item-quantity.use-case';
import { RemoveItemFromInvoiceUseCase } from '../../application/use-cases/remove-item-from-invoice.use-case';
import { FinalizeInvoiceUseCase } from '../../application/use-cases/finalize-invoice.use-case';

export const ApplicationProvider = ({ children }: { children: React.ReactNode }) => {
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
