export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  businessId: string;
  specialties?: string[];
  bio?: string;
  profilePicture?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAvailability {
  staffId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface StaffAssignment {
  _id: string;
  staffId: string;
  appointmentId: string;
  status: "assigned" | "confirmed" | "declined" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUnavailability {
  _id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringAppointment {
  _id: string;
  customerId: string;
  businessId: string;
  serviceId: string;
  staffId?: string;
  recurrencePattern: "daily" | "weekly" | "biweekly" | "monthly";
  startDate: string;
  endDate?: string;
  dayOfWeek?: number; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  startTime: string;
  endTime: string;
  status: "active" | "paused" | "completed" | "cancelled";
  notes?: string;
  appointmentIds: string[]; // IDs of individual appointments created from this recurring appointment
  createdAt: string;
  updatedAt: string;
}
