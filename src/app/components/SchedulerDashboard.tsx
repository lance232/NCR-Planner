import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Plus, 
  CalendarDays,
  Filter,
  Share2,
  Printer,
  LayoutGrid,
  CalendarCheck,
  Menu,
  User,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { formatTimeTo12Hour, formatTimeTo24Hour, generateTimeOptions } from '../utils/timeFormat';

type ViewType = 'day' | 'week' | 'month';

export function SchedulerDashboard() {
  const { user, logout, engineers, banks } = useAuth();
  const { bookings, getAllBankAvailabilities, createBooking, getBookingsByScheduler, assignEngineer } = useBookings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('week');
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showAvailabilitySchedule, setShowAvailabilitySchedule] = useState(false);
  const [selectedBankForAvailability, setSelectedBankForAvailability] = useState('');
  const [showEngineerAssignment, setShowEngineerAssignment] = useState(false);
  const [bookingToAssign, setBookingToAssign] = useState<any>(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [newBooking, setNewBooking] = useState({
    bankId: '',
    title: '',
    description: '',
    requestedDate: '',
    requestedTime: '',
  });

  const allAvailabilities = getAllBankAvailabilities();
  const myBookings = getBookingsByScheduler(user?.id || '');

  // Get unique banks from availabilities
  const availableBanks = Array.from(new Set(allAvailabilities.map(a => a.bankId))).map(id => {
    const availability = allAvailabilities.find(a => a.bankId === id);
    return { id, name: availability?.bankName || `Bank ${id}` };
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Mini calendar logic
  const getMiniCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Get week dates
  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  // Time slots for day/week view
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour} ${ampm}`;
  });

  const getBookingsForDateAndTime = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return myBookings.filter(b => {
      if (b.requestedDate !== dateStr) return false;
      const bookingHour = parseInt(b.requestedTime.split(':')[0]);
      return bookingHour === hour;
    });
  };

  const handleCreateBooking = () => {
    if (!newBooking.bankId || !newBooking.title || !newBooking.requestedDate || !newBooking.requestedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    createBooking({
      schedulerId: user?.id || '',
      schedulerName: user?.name || '',
      bankId: newBooking.bankId,
      title: newBooking.title,
      description: newBooking.description,
      requestedDate: newBooking.requestedDate,
      requestedTime: newBooking.requestedTime,
    });

    toast.success('Booking request created successfully!');
    setIsNewBookingDialogOpen(false);
    setNewBooking({
      bankId: '',
      title: '',
      description: '',
      requestedDate: '',
      requestedTime: '',
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const miniCalendarDays = getMiniCalendarDays(currentDate);
  const weekDates = getWeekDates(new Date(currentDate));

  // Get date range for display
  const getDateRangeText = () => {
    if (viewType === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (viewType === 'week') {
      const week = getWeekDates(new Date(currentDate));
      const start = week[0];
      const end = week[6];
      return `${monthNames[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Header */}
      <header className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold">NCR Planner</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
        <Button 
          onClick={() => setIsNewBookingDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          New event
        </Button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
          <Button
            variant={viewType === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewType('day')}
            className="h-7 text-xs"
          >
            Day
          </Button>
          <Button
            variant={viewType === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewType('week')}
            className="h-7 text-xs"
          >
            Week
          </Button>
          <Button
            variant={viewType === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewType('month')}
            className="h-7 text-xs"
          >
            Month
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <Button variant="ghost" size="sm">
          <Filter className="w-4 h-4 mr-1" />
          Filter
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
        <Button variant="ghost" size="sm">
          <Printer className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r bg-white overflow-auto">
          <div className="p-4">
            {/* Today Button */}
            <Button 
              variant="outline" 
              className="w-full mb-4 justify-start" 
              size="sm"
              onClick={goToToday}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Today
            </Button>

            {/* Mini Calendar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="h-6 w-6 p-0">
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-6 w-6 p-0">
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                {dayNamesShort.map((day, i) => (
                  <div key={i} className="text-gray-500 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {miniCalendarDays.map((day, index) => {
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const isSelected = day && day.toDateString() === currentDate.toDateString();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => day && setCurrentDate(new Date(day))}
                      className={`
                        h-7 text-xs rounded flex items-center justify-center
                        ${!day ? 'invisible' : ''}
                        ${isToday ? 'bg-blue-600 text-white font-semibold' : ''}
                        ${isSelected && !isToday ? 'bg-blue-100 text-blue-700' : ''}
                        ${!isToday && !isSelected ? 'hover:bg-gray-100' : ''}
                      `}
                    >
                      {day?.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-3 space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs text-blue-600"
                onClick={() => setShowMyBookings(true)}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Go to my booking page
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs text-blue-600"
                onClick={() => setShowAvailabilitySchedule(true)}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Availability Schedule
              </Button>
            </div>

            {/* My Calendars */}
            <div className="border-t mt-4 pt-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">My calendars</h4>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm">Calendar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Date Header */}
          <div className="border-b px-6 py-3 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => {
                const newDate = new Date(currentDate);
                if (viewType === 'day') newDate.setDate(currentDate.getDate() - 1);
                else if (viewType === 'week') newDate.setDate(currentDate.getDate() - 7);
                else newDate.setMonth(currentDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">{getDateRangeText()}</h2>
              <Button variant="ghost" size="sm" onClick={() => {
                const newDate = new Date(currentDate);
                if (viewType === 'day') newDate.setDate(currentDate.getDate() + 1);
                else if (viewType === 'week') newDate.setDate(currentDate.getDate() + 7);
                else newDate.setMonth(currentDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {viewType === 'week' && (
              <div className="min-w-full">
                {/* Week Header */}
                <div className="sticky top-0 z-10 bg-white border-b">
                  <div className="flex">
                    <div className="w-20 flex-shrink-0 border-r"></div>
                    {weekDates.map((date, i) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div key={i} className="flex-1 text-center py-3 border-r">
                          <div className={`text-xs text-gray-500 mb-1`}>
                            {dayNamesFull[date.getDay()].slice(0, 3)}
                          </div>
                          <div className={`text-2xl font-light ${isToday ? 'bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                            {date.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {timeSlots.map((time, hour) => (
                    <div key={hour} className="flex border-b" style={{ minHeight: '60px' }}>
                      <div className="w-20 flex-shrink-0 border-r px-2 py-1 text-xs text-gray-500 text-right">
                        {hour === 0 ? '' : time}
                      </div>
                      {weekDates.map((date, dayIndex) => {
                        const bookings = getBookingsForDateAndTime(date, hour);
                        return (
                          <div key={dayIndex} className="flex-1 border-r relative p-1">
                            {bookings.map((booking, idx) => (
                              <div
                                key={idx}
                                onClick={() => setSelectedEvent(booking)}
                                className={`text-xs p-2 rounded border ${getStatusColor(booking.status)} mb-1 cursor-pointer hover:shadow-md transition-shadow`}
                              >
                                <div className="font-semibold truncate">{booking.title}</div>
                                <div className="text-xs opacity-75">{booking.requestedTime}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewType === 'day' && (
              <div className="min-w-full">
                {/* Day Header */}
                <div className="sticky top-0 z-10 bg-white border-b">
                  <div className="flex">
                    <div className="w-20 flex-shrink-0 border-r"></div>
                    <div className="flex-1 text-center py-3">
                      <div className="text-xs text-gray-500 mb-1">
                        {dayNamesFull[currentDate.getDay()]}
                      </div>
                      <div className="text-2xl font-light">
                        {currentDate.getDate()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {timeSlots.map((time, hour) => {
                    const bookings = getBookingsForDateAndTime(currentDate, hour);
                    return (
                      <div key={hour} className="flex border-b" style={{ minHeight: '60px' }}>
                        <div className="w-20 flex-shrink-0 border-r px-2 py-1 text-xs text-gray-500 text-right">
                          {hour === 0 ? '' : time}
                        </div>
                        <div className="flex-1 relative p-1">
                          {bookings.map((booking, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-2 rounded border ${getStatusColor(booking.status)} mb-1 cursor-pointer hover:shadow-md transition-shadow`}
                            >
                              <div className="font-semibold">{booking.title}</div>
                              <div className="text-xs opacity-75">{booking.requestedTime}</div>
                              <div className="text-xs opacity-75">Bank: {booking.bankId}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewType === 'month' && (
              <div className="p-4">
                <Card>
                  <div className="grid grid-cols-7">
                    {dayNamesFull.map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 border-r border-b bg-gray-50">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7" style={{ gridAutoRows: '120px' }}>
                    {miniCalendarDays.map((day, index) => {
                      const isToday = day && day.toDateString() === new Date().toDateString();
                      const dateStr = day?.toISOString().split('T')[0];
                      const dayBookings = day ? myBookings.filter(b => b.requestedDate === dateStr) : [];
                      
                      return (
                        <div
                          key={index}
                          className={`border-r border-b p-2 ${
                            day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                          }`}
                        >
                          {day && (
                            <>
                              <div className={`text-sm mb-1 ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-semibold' : ''}`}>
                                {day.getDate()}
                              </div>
                              <div className="space-y-1">
                                {dayBookings.slice(0, 3).map((booking, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs p-1 rounded truncate ${getStatusColor(booking.status)}`}
                                  >
                                    {booking.title}
                                  </div>
                                ))}
                                {dayBookings.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayBookings.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Booking Dialog */}
      <Dialog open={isNewBookingDialogOpen} onOpenChange={setIsNewBookingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Booking Request</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new booking request for bank approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Select Bank</Label>
              <Select value={newBooking.bankId} onValueChange={(value) => setNewBooking({ ...newBooking, bankId: value })}>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Choose a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.bankId}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g., System Upgrade"
                value={newBooking.title}
                onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide additional details..."
                value={newBooking.description}
                onChange={(e) => setNewBooking({ ...newBooking, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newBooking.requestedDate}
                  onChange={(e) => setNewBooking({ ...newBooking, requestedDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newBooking.requestedTime}
                  onChange={(e) => setNewBooking({ ...newBooking, requestedTime: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsNewBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBooking}>
                Create Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Booking request details
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedEvent.status)}>
                      {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Bank</Label>
                  <p className="mt-1 font-medium">{selectedEvent.bankId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
                  <p className="mt-1 font-medium">{selectedEvent.requestedDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Time</Label>
                  <p className="mt-1 font-medium">{selectedEvent.requestedTime}</p>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Scheduler</Label>
                  <p className="mt-1">{selectedEvent.schedulerName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <p className="mt-1">{new Date(selectedEvent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedEvent.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <Label className="text-xs text-red-700 font-semibold">Rejection Reason</Label>
                  <p className="mt-1 text-sm text-red-600">{selectedEvent.rejectionReason}</p>
                </div>
              )}

              {selectedEvent.engineerNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <Label className="text-xs text-blue-700 font-semibold">Engineer Notes</Label>
                  <p className="mt-1 text-sm text-blue-600">{selectedEvent.engineerNotes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* My Bookings Dialog */}
      <Dialog open={showMyBookings} onOpenChange={setShowMyBookings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">My Booking Page</DialogTitle>
            <DialogDescription>
              All your scheduled and planned events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No bookings found</p>
                <p className="text-sm">Create your first booking to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((booking) => (
                  <Card 
                    key={booking.id} 
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{booking.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{booking.description}</p>
                          <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            <span>📅 {booking.requestedDate}</span>
                            <span>🕐 {booking.requestedTime}</span>
                            <span>🏦 {booking.bankId}</span>
                          </div>
                          {booking.engineerName && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-700">Assigned to: <strong>{booking.engineerName}</strong></span>
                              </div>
                              {booking.status === 'approved' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-blue-600 hover:text-blue-700 h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBookingToAssign(booking);
                                    setSelectedEngineerId(booking.engineerId || '');
                                    setShowEngineerAssignment(true);
                                  }}
                                >
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Reassign
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      {booking.rejectionReason && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-xs font-semibold text-red-700">Rejected:</p>
                          <p className="text-sm text-red-600">{booking.rejectionReason}</p>
                        </div>
                      )}
                      {booking.status === 'approved' && !booking.engineerId && (
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingToAssign(booking);
                              setSelectedEngineerId('');
                              setShowEngineerAssignment(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Engineer
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Availability Schedule Dialog */}
      <Dialog open={showAvailabilitySchedule} onOpenChange={setShowAvailabilitySchedule}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Bank Availability Schedule</DialogTitle>
            <DialogDescription>
              View available schedules from different banks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank-select">Select Bank</Label>
              <Select value={selectedBankForAvailability} onValueChange={setSelectedBankForAvailability}>
                <SelectTrigger id="bank-select">
                  <SelectValue placeholder="Choose a bank to view availability" />
                </SelectTrigger>
                <SelectContent>
                  {availableBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBankForAvailability ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {availableBanks.find(b => b.id === selectedBankForAvailability)?.name} - Available Slots
                </h3>
                <div className="space-y-3">
                  {allAvailabilities
                    .filter(a => a.bankId === selectedBankForAvailability && a.isAvailable)
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((availability) => (
                      <Card key={availability.id} className="hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  {new Date(availability.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="text-blue-600">🕐</span>
                                {availability.startTime} - {availability.endTime}
                              </div>
                              {availability.notes && (
                                <p className="text-sm text-gray-600 mt-2">{availability.notes}</p>
                              )}
                            </div>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Available
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  {allAvailabilities.filter(a => a.bankId === selectedBankForAvailability && a.isAvailable).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No available slots for this bank</p>
                      <p className="text-sm">Check back later for updates</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Please select a bank to view their availability</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Engineer Assignment Dialog */}
      <Dialog open={showEngineerAssignment} onOpenChange={setShowEngineerAssignment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Assign Engineer to Booking</DialogTitle>
            <DialogDescription>
              Select an engineer to assign to the booking
            </DialogDescription>
          </DialogHeader>
          {bookingToAssign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(bookingToAssign.status)}>
                      {bookingToAssign.status.charAt(0).toUpperCase() + bookingToAssign.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Bank</Label>
                  <p className="mt-1 font-medium">{bookingToAssign.bankId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
                  <p className="mt-1 font-medium">{bookingToAssign.requestedDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Time</Label>
                  <p className="mt-1 font-medium">{bookingToAssign.requestedTime}</p>
                </div>
              </div>

              {bookingToAssign.description && (
                <div>
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="mt-1">{bookingToAssign.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Scheduler</Label>
                  <p className="mt-1">{bookingToAssign.schedulerName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <p className="mt-1">{new Date(bookingToAssign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {bookingToAssign.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <Label className="text-xs text-red-700 font-semibold">Rejection Reason</Label>
                  <p className="mt-1 text-sm text-red-600">{bookingToAssign.rejectionReason}</p>
                </div>
              )}

              {bookingToAssign.engineerNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <Label className="text-xs text-blue-700 font-semibold">Engineer Notes</Label>
                  <p className="mt-1 text-sm text-blue-600">{bookingToAssign.engineerNotes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="engineer-select">Select Engineer</Label>
                <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
                  <SelectTrigger id="engineer-select">
                    <SelectValue placeholder="Choose an engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineers.map((engineer) => (
                      <SelectItem key={engineer.id} value={engineer.id}>
                        {engineer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEngineerAssignment(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (selectedEngineerId) {
                    const selectedEngineer = engineers.find(e => e.id === selectedEngineerId);
                    if (selectedEngineer) {
                      assignEngineer(bookingToAssign.id, selectedEngineerId, selectedEngineer.name);
                      toast.success('Engineer assigned successfully!');
                      setShowEngineerAssignment(false);
                    }
                  } else {
                    toast.error('Please select an engineer');
                  }
                }}>
                  Assign Engineer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}