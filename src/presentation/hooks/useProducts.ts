import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApplication } from '../context/ApplicationContext';
import { Product } from '../../domain/entities/product.entity';

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { repositories } = useApplication();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => repositories.productRepository.findAll(),
  });

  const createProductMutation = useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => repositories.productRepository.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    createProduct: createProductMutation.mutate,
  };
};
