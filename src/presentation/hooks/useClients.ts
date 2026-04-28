import { useQuery } from '@tanstack/react-query';
import { useApplication } from '../context/ApplicationContext';

export const useClients = () => {
  const { repositories } = useApplication();

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: () => repositories.clientRepository.findAll(),
  });

  return {
    clients: clientsQuery.data ?? [],
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
  };
};
