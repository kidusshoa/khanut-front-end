import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService, CustomerProfile, ProfileUpdateData } from '@/services/customer';
import { toast } from 'react-hot-toast';

export function useCustomerProfile(customerId?: string) {
  const queryClient = useQueryClient();
  
  // Fetch customer profile
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customerProfile', customerId],
    queryFn: () => customerService.getCustomerProfile(customerId as string),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: ProfileUpdateData) => 
      customerService.updateCustomerProfile(customerId as string, profileData),
    
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['customerProfile', customerId] });
      
      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<CustomerProfile>(['customerProfile', customerId]);
      
      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData(['customerProfile', customerId], {
          ...previousProfile,
          ...newProfileData,
        });
      }
      
      return { previousProfile };
    },
    
    onError: (err, newProfileData, context) => {
      // If there was an error, roll back to the previous value
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ['customerProfile', customerId],
          context.previousProfile
        );
      }
      toast.error('Failed to update profile');
    },
    
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['customerProfile', customerId] });
    },
  });

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => customerService.uploadProfilePicture(customerId as string, file),
    
    onSuccess: (data) => {
      // Update the profile with the new profile picture URL
      updateProfileMutation.mutate({ profilePicture: data.url });
      toast.success('Profile picture uploaded successfully');
    },
    
    onError: () => {
      toast.error('Failed to upload profile picture');
    },
  });

  // Notification settings query
  const {
    data: notificationSettings,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
  } = useQuery({
    queryKey: ['notificationSettings', customerId],
    queryFn: () => customerService.getNotificationSettings(customerId as string),
    enabled: !!customerId,
  });

  // Update notification settings mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: (settings: any) => 
      customerService.updateNotificationSettings(customerId as string, settings),
    
    onSuccess: () => {
      toast.success('Notification settings updated');
      queryClient.invalidateQueries({ queryKey: ['notificationSettings', customerId] });
    },
    
    onError: () => {
      toast.error('Failed to update notification settings');
    },
  });

  // Security settings query
  const {
    data: securitySettings,
    isLoading: isLoadingSecurity,
    isError: isErrorSecurity,
  } = useQuery({
    queryKey: ['securitySettings', customerId],
    queryFn: () => customerService.getSecuritySettings(customerId as string),
    enabled: !!customerId,
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }) => 
      customerService.updatePassword(customerId as string, currentPassword, newPassword),
    
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    
    onError: () => {
      toast.error('Failed to update password');
    },
  });

  return {
    // Profile data and state
    profile,
    isLoading,
    isError,
    error,
    refetch,
    
    // Profile mutations
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    
    // Profile picture upload
    uploadProfilePicture: uploadProfilePictureMutation.mutate,
    isUploadingPicture: uploadProfilePictureMutation.isPending,
    
    // Notification settings
    notificationSettings,
    isLoadingNotifications,
    isErrorNotifications,
    updateNotificationSettings: updateNotificationSettingsMutation.mutate,
    isUpdatingNotifications: updateNotificationSettingsMutation.isPending,
    
    // Security settings
    securitySettings,
    isLoadingSecurity,
    isErrorSecurity,
    updatePassword: updatePasswordMutation.mutate,
    isUpdatingPassword: updatePasswordMutation.isPending,
  };
}
