import React, { createContext, useContext, useState, ReactNode } from 'react';

// Status types for booking requests
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'completed';

// Bank availability time slot data structure
export interface BankAvailability {
  id: string;
  bankId: string;
  bankName: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  notes?: string;
}

// Booking request data structure
export interface Booking {
  id: string;
  schedulerId: string;
  schedulerName: string;
  bankId: string;
  title: string;
  description: string;
  requestedDate: string;
  requestedTime: string;
  status: BookingStatus;
  createdAt: string;
  rejectionReason?: string;
  preferableDate?: string;
  preferableTime?: string;
  preferableSite?: string;
  engineerNotes?: string;
  previousVersionId?: string; // Link to the previous version if rescheduled
  engineerId?: string; // Assigned engineer
  engineerName?: string; // Assigned engineer name
  assignedAt?: string; // When engineer was assigned
}

// Booking context interface - defines all booking-related methods
interface BookingContextType {
  bookings: Booking[];
  bankAvailabilities: BankAvailability[];
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus, data?: {
    rejectionReason?: string;
    preferableDate?: string;
    preferableTime?: string;
    preferableSite?: string;
    engineerNotes?: string;
  }) => void;
  rescheduleBooking: (originalId: string, newDate: string, newTime: string) => void;
  assignEngineer: (bookingId: string, engineerId: string, engineerName: string) => void;
  getBookingsByStatus: (status: BookingStatus) => Booking[];
  getBookingsByScheduler: (schedulerId: string) => Booking[];
  getBankAvailability: (bankId: string) => BankAvailability[];
  getAllBankAvailabilities: () => BankAvailability[];
  addBankAvailability: (availability: Omit<BankAvailability, 'id'>) => void;
  deleteBankAvailability: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  // Demo booking data for testing
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      schedulerId: '1',
      schedulerName: 'John Scheduler',
      bankId: 'bank1',
      title: 'Site Inspection - Downtown Project',
      description: 'Need custom engineering inspection for new construction site',
      requestedDate: '2026-03-25',
      requestedTime: '10:00',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      schedulerId: '1',
      schedulerName: 'John Scheduler',
      bankId: 'bank1',
      title: 'Equipment Evaluation',
      description: 'Evaluate new machinery installation requirements',
      requestedDate: '2026-03-26',
      requestedTime: '14:00',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  // Demo bank availability data for testing
  const [bankAvailabilities, setBankAvailabilities] = useState<BankAvailability[]>([
    // Bank A availability
    { id: '1', bankId: 'bank1', bankName: 'Bank A', date: '2026-03-24', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available for inspections' },
    { id: '2', bankId: 'bank1', bankName: 'Bank A', date: '2026-03-25', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available for inspections' },
    { id: '3', bankId: 'bank1', bankName: 'Bank A', date: '2026-03-26', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available for inspections' },
    { id: '4', bankId: 'bank1', bankName: 'Bank A', date: '2026-03-27', startTime: '09:00', endTime: '13:00', isAvailable: true, notes: 'Morning only' },
    { id: '5', bankId: 'bank1', bankName: 'Bank A', date: '2026-03-30', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Full day available' },
    { id: '6', bankId: 'bank1', bankName: 'Bank A', date: '2026-03-31', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Full day available' },
    
    // Bank B availability
    { id: '7', bankId: 'bank2', bankName: 'Bank B', date: '2026-03-24', startTime: '10:00', endTime: '16:00', isAvailable: true, notes: 'Limited hours' },
    { id: '8', bankId: 'bank2', bankName: 'Bank B', date: '2026-03-25', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available all day' },
    { id: '9', bankId: 'bank2', bankName: 'Bank B', date: '2026-03-28', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available all day' },
    { id: '10', bankId: 'bank2', bankName: 'Bank B', date: '2026-03-31', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available all day' },
    
    // Bank C availability
    { id: '11', bankId: 'bank3', bankName: 'Bank C', date: '2026-03-26', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available for meetings' },
    { id: '12', bankId: 'bank3', bankName: 'Bank C', date: '2026-03-27', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available for meetings' },
    { id: '13', bankId: 'bank3', bankName: 'Bank C', date: '2026-03-28', startTime: '09:00', endTime: '12:00', isAvailable: true, notes: 'Morning slots only' },
    { id: '14', bankId: 'bank3', bankName: 'Bank C', date: '2026-04-01', startTime: '09:00', endTime: '17:00', isAvailable: true, notes: 'Available all day' },
  ]);

  // Create a new booking request
  const createBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  // Update booking status (approve, reject, complete)
  const updateBookingStatus = (id: string, status: BookingStatus, data?: {
    rejectionReason?: string;
    preferableDate?: string;
    preferableTime?: string;
    preferableSite?: string;
    engineerNotes?: string;
  }) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === id) {
        if (status === 'rejected') {
          return { 
            ...booking, 
            status, 
            rejectionReason: data?.rejectionReason,
            preferableDate: data?.preferableDate,
            preferableTime: data?.preferableTime,
            preferableSite: data?.preferableSite
          };
        } else if (status === 'completed') {
          return { ...booking, status, engineerNotes: data?.engineerNotes };
        }
        return { ...booking, status };
      }
      return booking;
    }));
  };

  // Create a rescheduled version of a rejected booking
  const rescheduleBooking = (originalId: string, newDate: string, newTime: string) => {
    const originalBooking = bookings.find(b => b.id === originalId);
    if (originalBooking) {
      const rescheduledBooking: Booking = {
        ...originalBooking,
        id: Math.random().toString(36).substr(2, 9),
        requestedDate: newDate,
        requestedTime: newTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
        previousVersionId: originalId,
      };
      setBookings(prev => [rescheduledBooking, ...prev]);
    }
  };

  // Assign an engineer to an approved booking
  const assignEngineer = (bookingId: string, engineerId: string, engineerName: string) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, engineerId, engineerName, assignedAt: new Date().toISOString() };
      }
      return booking;
    }));
  };

  // Filter bookings by status
  const getBookingsByStatus = (status: BookingStatus) => {
    return bookings.filter(b => b.status === status);
  };

  // Filter bookings by scheduler
  const getBookingsByScheduler = (schedulerId: string) => {
    return bookings.filter(b => b.schedulerId === schedulerId);
  };

  // Get availability for a specific bank
  const getBankAvailability = (bankId: string) => {
    return bankAvailabilities.filter(b => b.bankId === bankId);
  };

  // Get all bank availabilities
  const getAllBankAvailabilities = () => {
    return bankAvailabilities;
  };

  // Add new bank availability slot
  const addBankAvailability = (availability: Omit<BankAvailability, 'id'>) => {
    const newAvailability: BankAvailability = {
      ...availability,
      id: Math.random().toString(36).substr(2, 9),
    };
    setBankAvailabilities(prev => [newAvailability, ...prev]);
  };

  // Delete bank availability slot
  const deleteBankAvailability = (id: string) => {
    setBankAvailabilities(prev => prev.filter(a => a.id !== id));
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      bankAvailabilities,
      createBooking,
      updateBookingStatus,
      rescheduleBooking,
      assignEngineer,
      getBookingsByStatus,
      getBookingsByScheduler,
      getBankAvailability,
      getAllBankAvailabilities,
      addBankAvailability,
      deleteBankAvailability,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook to use booking context
export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}