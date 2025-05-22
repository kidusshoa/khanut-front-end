import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi, FavoriteItem } from '@/services/favorites';
import { toast } from 'react-hot-toast';

export function useFavorites(customerId?: string) {
  const queryClient = useQueryClient();
  
  // Fetch favorites
  const {
    data: favorites = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['favorites', customerId],
    queryFn: () => favoritesApi.getFavorites(customerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (businessId: string) => 
      favoritesApi.toggleFavorite(businessId, customerId),
    
    // When mutate is called:
    onMutate: async (businessId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', customerId] });
      
      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<FavoriteItem[]>(['favorites', customerId]);
      
      // Check if business is already favorited
      const isFavorited = previousFavorites?.some(fav => 
        fav._id === businessId || 
        (typeof fav === 'object' && fav._id === businessId)
      );
      
      // Optimistically update the cache
      if (previousFavorites) {
        if (isFavorited) {
          // Remove from favorites
          queryClient.setQueryData<FavoriteItem[]>(
            ['favorites', customerId],
            previousFavorites.filter(fav => fav._id !== businessId)
          );
        } else {
          // Add to favorites (with minimal data until refetch)
          queryClient.setQueryData<FavoriteItem[]>(
            ['favorites', customerId],
            [
              ...previousFavorites,
              { 
                _id: businessId,
                name: 'Loading...',
                description: 'Loading business details...',
              } as FavoriteItem
            ]
          );
        }
      }
      
      // Return the snapshot so we can rollback if something goes wrong
      return { previousFavorites };
    },
    
    // If the mutation fails, use the context we returned above
    onError: (err, businessId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(
          ['favorites', customerId],
          context.previousFavorites
        );
      }
      toast.error('Failed to update favorites');
      console.error('Error toggling favorite:', err);
    },
    
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', customerId] });
    },
  });

  // Check if a business is favorited
  const isFavorite = (businessId: string) => {
    if (!favorites) return false;
    
    return favorites.some(fav => {
      // Clean IDs for comparison
      const cleanFavId = fav._id.replace(/[^a-f0-9]/gi, '').substring(0, 24);
      const cleanBusinessId = businessId.replace(/[^a-f0-9]/gi, '').substring(0, 24);
      return cleanFavId === cleanBusinessId;
    });
  };

  // Add favorite
  const addFavorite = (businessId: string) => {
    toggleFavoriteMutation.mutate(businessId);
  };

  // Remove favorite
  const removeFavorite = (businessId: string) => {
    toggleFavoriteMutation.mutate(businessId);
  };

  return {
    favorites,
    isLoading,
    isError,
    error,
    refetch,
    isFavorite,
    addFavorite,
    removeFavorite,
    isToggling: toggleFavoriteMutation.isPending,
  };
}
