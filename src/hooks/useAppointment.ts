import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi, Appointment, TimeSlot } from '@/services/appointment';
import { toast } from 'react-hot-toast';
import { AppointmentBookingInput } from '@/lib/validations/service';

// Appointment query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  availableSlots: () => [...appointmentKeys.all, 'availableSlots'] as const,
  availableSlot: (serviceId: string, date: string) => 
    [...appointmentKeys.availableSlots(), serviceId, date] as const,
};

export const useCustomerAppointments = (customerId: string, filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: appointmentKeys.list({ customerId, ...filters }),
    queryFn: () => appointmentApi.getCustomerAppointments(customerId, filters),
    enabled: !!customerId,
  });
};

export const useBusinessAppointments = (businessId: string, filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: appointmentKeys.list({ businessId, ...filters }),
    queryFn: () => appointmentApi.getBusinessAppointments(businessId, filters),
    enabled: !!businessId,
  });
};

export const useAppointmentDetails = (appointmentId: string) => {
  return useQuery({
    queryKey: appointmentKeys.detail(appointmentId),
    queryFn: () => appointmentApi.getAppointmentById(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useAvailableTimeSlots = (serviceId: string, date: string, staffId?: string) => {
  return useQuery({
    queryKey: appointmentKeys.availableSlot(serviceId, date),
    queryFn: () => appointmentApi.getAvailableTimeSlots(serviceId, date, staffId),
    enabled: !!serviceId && !!date,
  });
};

export const useAppointmentMutations = () => {
  const queryClient = useQueryClient();

  // Book appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: (appointmentData: AppointmentBookingInput & { staffId?: string }) => 
      appointmentApi.createAppointment(appointmentData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Show success message
      toast.success('Appointment booked successfully');
      
      // Return the data for further processing
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to book appointment');
    },
  });

  // Update appointment status
  const updateStatusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: string }) => 
      appointmentApi.updateAppointmentStatus(appointmentId, status),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: appointmentKeys.detail(variables.appointmentId) 
      });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Show success message
      toast.success(`Appointment ${variables.status} successfully`);
      
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appointment status');
    },
  });

  // Update appointment details
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ 
      appointmentId, 
      appointmentData 
    }: { 
      appointmentId: string; 
      appointmentData: Partial<AppointmentBookingInput> 
    }) => 
      appointmentApi.updateAppointment(appointmentId, appointmentData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: appointmentKeys.detail(variables.appointmentId) 
      });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Show success message
      toast.success('Appointment updated successfully');
      
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });

  // Cancel appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: (appointmentId: string) => 
      appointmentApi.updateAppointmentStatus(appointmentId, 'cancelled'),
    onSuccess: (data, appointmentId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: appointmentKeys.detail(appointmentId) 
      });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      // Show success message
      toast.success('Appointment cancelled successfully');
      
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });

  return {
    bookAppointment: bookAppointmentMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    
    isBooking: bookAppointmentMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isCancelling: cancelAppointmentMutation.isPending,
  };
};
