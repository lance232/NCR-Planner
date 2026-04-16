import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookings, Booking } from '../context/BookingContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Calendar, Clock, LogOut, CheckCircle, XCircle, AlertCircle, MapPin, Plus, LayoutDashboard, CalendarCheck, FileText, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function BankDashboard() {
  const { user, logout } = useAuth();
  const { bookings, updateBookingStatus, getBankAvailability, addBankAvailability } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'approved' | 'rejected' | 'availability'>('overview');
  const [rejectionData, setRejectionData] = useState({
    rejectionReason: '',
    preferableDate: '',
    preferableTime: '',
    preferableSite: '',
  });
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  // Filter bookings for this bank only
  const myBankBookings = bookings.filter(b => b.bankId === user?.bankId);
  const pendingBookings = myBankBookings.filter(b => b.status === 'pending');
  const approvedBookings = myBankBookings.filter(b => b.status === 'approved');
  const rejectedBookings = myBankBookings.filter(b => b.status === 'rejected');

  // Get my bank's availability
  const myAvailability = getBankAvailability(user?.bankId || '');

  const handleReview = (booking: Booking, action: 'approve' | 'reject') => {
    setSelectedBooking(booking);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const handleConfirmReview = () => {
    if (selectedBooking) {
      if (reviewAction === 'approve') {
        updateBookingStatus(selectedBooking.id, 'approved');
        toast.success('Booking approved successfully!');
      } else {
        updateBookingStatus(selectedBooking.id, 'rejected', rejectionData);
        toast.error('Booking rejected');
      }
      setIsReviewDialogOpen(false);
      setSelectedBooking(null);
      setRejectionData({
        rejectionReason: '',
        preferableDate: '',
        preferableTime: '',
        preferableSite: '',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const BookingCard = ({ booking, showActions = false }: { booking: Booking; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
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
            <Calendar className="w-4 h-4 text-blue-600" />
            {new Date(booking.requestedDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            {booking.requestedTime}
          </div>
        </div>

        {booking.previousVersionId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
            <p className="text-xs text-blue-700">This is a rescheduled booking</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => handleReview(booking, 'approve')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => handleReview(booking, 'reject')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {booking.status === 'rejected' && (
          <div className="mt-4 space-y-3">
            {booking.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{booking.rejectionReason}</p>
              </div>
            )}
            {(booking.preferableDate || booking.preferableTime || booking.preferableSite) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
                <p className="text-sm font-medium text-blue-800">Your Suggestions:</p>
                {booking.preferableDate && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Calendar className="w-4 h-4" />
                    Preferable Date: {new Date(booking.preferableDate).toLocaleDateString()}
                  </div>
                )}
                {booking.preferableTime && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="w-4 h-4" />
                    Preferable Time: {booking.preferableTime}
                  </div>
                )}
                {booking.preferableSite && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <MapPin className="w-4 h-4" />
                    Preferable Site: {booking.preferableSite}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 p-2 rounded">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">NCR Bank</h2>
              <p className="text-xs text-gray-500">{user?.bankId}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Pending Requests
              {pendingBookings.length > 0 && (
                <Badge className="ml-auto bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  {pendingBookings.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'approved'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Approved
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'rejected'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Rejected
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'availability'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              My Availability
            </button>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'pending' && 'Pending Requests'}
                {activeTab === 'approved' && 'Approved Bookings'}
                {activeTab === 'rejected' && 'Rejected Bookings'}
                {activeTab === 'availability' && 'My Availability Schedule'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'overview' && 'View your booking statistics and recent activity'}
                {activeTab === 'pending' && 'Review and respond to booking requests'}
                {activeTab === 'approved' && 'View all approved bookings'}
                {activeTab === 'rejected' && 'View rejected booking requests'}
                {activeTab === 'availability' && 'Manage your availability schedule'}
              </p>
            </div>
            {activeTab === 'availability' && (
              <Button onClick={() => setIsAvailabilityDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">{pendingBookings.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Requires action</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{approvedBookings.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Total approved</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{rejectedBookings.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Total rejected</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Booking Requests</h2>
                <div className="grid gap-4">
                  {myBankBookings.slice(0, 5).length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No booking requests yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    myBankBookings.slice(0, 5).map((booking) => (
                      <BookingCard key={booking.id} booking={booking} showActions={booking.status === 'pending'} />
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="grid gap-4">
              {pendingBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending booking requests</p>
                    <p className="text-sm text-gray-500 mt-1">All requests have been reviewed</p>
                  </CardContent>
                </Card>
              ) : (
                pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showActions={true} />
                ))
              )}
            </div>
          )}

          {/* Approved Tab */}
          {activeTab === 'approved' && (
            <div className="grid gap-4">
              {approvedBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No approved bookings yet</p>
                  </CardContent>
                </Card>
              ) : (
                approvedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          )}

          {/* Rejected Tab */}
          {activeTab === 'rejected' && (
            <div className="grid gap-4">
              {rejectedBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No rejected bookings</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="grid gap-4">
              {myAvailability.length > 0 ? (
                myAvailability.map((avail) => (
                  <Card key={avail.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-6 mb-2">
                            <div className="flex items-center gap-2 text-base font-medium">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              {new Date(avail.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 ml-7">
                            <Clock className="w-4 h-4 text-blue-600" />
                            {avail.startTime} - {avail.endTime}
                          </div>
                          {avail.notes && (
                            <p className="text-sm text-gray-600 mt-3 ml-7 bg-gray-50 p-2 rounded">{avail.notes}</p>
                          )}
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No availability schedule found</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Add Availability" to create your schedule</p>
                    <Button 
                      onClick={() => setIsAvailabilityDialogOpen(true)} 
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Availability
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {reviewAction === 'approve' ? '✓ Approve Booking' : '✗ Reject Booking'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedBooking?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewAction === 'reject' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason" className="text-base">Rejection Reason / Remarks *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Explain why this booking is being rejected..."
                    value={rejectionData.rejectionReason}
                    onChange={(e) => setRejectionData({ ...rejectionData, rejectionReason: e.target.value })}
                    rows={4}
                    required
                    className="text-base"
                  />
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">📝 Suggestions (Optional)</p>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="preferable-site" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        Preferable Site
                      </Label>
                      <Input
                        id="preferable-site"
                        placeholder="e.g., Main Office Building"
                        value={rejectionData.preferableSite}
                        onChange={(e) => setRejectionData({ ...rejectionData, preferableSite: e.target.value })}
                        className="text-base"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="preferable-date" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          Preferable Date
                        </Label>
                        <div className="relative">
                          <Input
                            id="preferable-date"
                            type="date"
                            value={rejectionData.preferableDate}
                            onChange={(e) => setRejectionData({ ...rejectionData, preferableDate: e.target.value })}
                            className="text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferable-time" className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          Preferable Time
                        </Label>
                        <div className="relative">
                          <Input
                            id="preferable-time"
                            type="time"
                            value={rejectionData.preferableTime}
                            onChange={(e) => setRejectionData({ ...rejectionData, preferableTime: e.target.value })}
                            className="text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {reviewAction === 'approve' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    Are you sure you want to approve this booking? It will be assigned to the Custom Engineer.
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsReviewDialogOpen(false);
                  setRejectionData({
                    rejectionReason: '',
                    preferableDate: '',
                    preferableTime: '',
                    preferableSite: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={handleConfirmReview}
                disabled={reviewAction === 'reject' && !rejectionData.rejectionReason}
              >
                {reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Availability Dialog */}
      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              Add Availability
            </DialogTitle>
            <DialogDescription>
              Set your available time slots for booking requests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availability-date" className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-blue-600" />
                Date *
              </Label>
              <Input
                id="availability-date"
                type="date"
                value={newAvailability.date}
                onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                required
                className="text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Start Time *
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time" className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-blue-600" />
                  End Time *
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                  required
                  className="text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability-notes" className="text-base">Notes (Optional)</Label>
              <Textarea
                id="availability-notes"
                placeholder="e.g., Available for inspections, Limited capacity, etc."
                value={newAvailability.notes}
                onChange={(e) => setNewAvailability({ ...newAvailability, notes: e.target.value })}
                rows={3}
                className="text-base"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAvailabilityDialogOpen(false);
                  setNewAvailability({
                    date: '',
                    startTime: '',
                    endTime: '',
                    notes: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!newAvailability.date || !newAvailability.startTime || !newAvailability.endTime) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  addBankAvailability({
                    bankId: user?.bankId || '',
                    bankName: user?.name || '',
                    date: newAvailability.date,
                    startTime: newAvailability.startTime,
                    endTime: newAvailability.endTime,
                    isAvailable: true,
                    notes: newAvailability.notes,
                  });
                  toast.success('Availability added successfully!');
                  setIsAvailabilityDialogOpen(false);
                  setNewAvailability({
                    date: '',
                    startTime: '',
                    endTime: '',
                    notes: '',
                  });
                }}
                disabled={!newAvailability.date || !newAvailability.startTime || !newAvailability.endTime}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
