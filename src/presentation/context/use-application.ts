import { useContext } from 'react';
import { ApplicationContext } from './application-context';

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error('useApplication debe usarse dentro de un ApplicationProvider');
  return context;
};
