import { RepositoryContext } from './repository-context';
import type { RepositoryContextValue } from './repository-context';

export const RepositoryProvider = ({ 
  repositories, 
  children 
}: { 
  repositories: RepositoryContextValue; 
  children: React.ReactNode 
}) => {
  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};
