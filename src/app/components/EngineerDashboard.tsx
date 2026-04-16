import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookings, Booking } from '../context/BookingContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Clock, LogOut, CheckCircle2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export function EngineerDashboard() {
  const { user, logout } = useAuth();
  const { updateBookingStatus, getBookingsByStatus } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const approvedBookings = getBookingsByStatus('approved');
  const completedBookings = getBookingsByStatus('completed');

  const handleComplete = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCompleteDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'completed', { engineerNotes: completionNotes });
      toast.success('Booking marked as completed!');
      setIsCompleteDialogOpen(false);
      setSelectedBooking(null);
      setCompletionNotes('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const BookingCard = ({ booking, showActions = false }: { booking: Booking; showActions?: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{booking.title}</CardTitle>
            <CardDescription className="mt-1">
              Requested by: {booking.schedulerName}
            </CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{booking.description}</p>
        <div className="flex gap-6 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(booking.requestedDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {booking.requestedTime}
          </div>
        </div>

        {booking.previousVersionId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
            <p className="text-xs text-blue-700">This is a rescheduled booking</p>
          </div>
        )}

        {showActions && (
          <Button
            className="w-full mt-4"
            onClick={() => handleComplete(booking)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Completed
          </Button>
        )}

        {booking.status === 'completed' && booking.engineerNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
            <p className="text-sm font-medium text-blue-800">Completion Notes:</p>
            <p className="text-sm text-blue-700">{booking.engineerNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Engineer Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{completedBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Bookings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Assigned Bookings</h2>
          <div className="grid gap-4">
            {approvedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assigned bookings at the moment</p>
                </CardContent>
              </Card>
            ) : (
              approvedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={true} />
              ))
            )}
          </div>
        </div>

        {/* Completed Bookings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Bookings</h2>
          <div className="grid gap-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 text-sm">No completed bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Booking as Completed</DialogTitle>
            <DialogDescription>
              {selectedBooking?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
              <Textarea
                id="completion-notes"
                placeholder="Add any notes about the completed work..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCompleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmComplete}
              >
                Mark as Completed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}