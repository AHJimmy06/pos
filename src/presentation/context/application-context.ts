import { createContext, type Context } from 'react';
import * as repos from '../../infrastructure/repositories';
import { AddItemToInvoiceUseCase } from '../../application/use-cases/add-item-to-invoice.use-case';
import { UpdateItemQuantityUseCase } from '../../application/use-cases/update-item-quantity.use-case';
import { RemoveItemFromInvoiceUseCase } from '../../application/use-cases/remove-item-from-invoice.use-case';
import { FinalizeInvoiceUseCase } from '../../application/use-cases/finalize-invoice.use-case';

interface ApplicationContextValue {
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

export const ApplicationContext: Context<ApplicationContextValue | null> = createContext<ApplicationContextValue | null>(null);
