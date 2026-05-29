import { useContext } from 'react';
import { RepositoryContext } from './repository-context';

export const useRepositories = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories debe usarse dentro de un RepositoryProvider');
  }
  return context;
};
