import { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Copy, LogOut, Shield } from 'lucide-react';

export function AdminDashboard() {
  const { user, logout, createUserAccount, getAllUsers, deleteUser } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'scheduler' as UserRole,
    bankId: '',
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const allUsers = getAllUsers();
  const regularUsers = allUsers.filter(u => u.id !== '0'); // Exclude admin from list

  const generateTemporaryPassword = () => {
    // Generate a random 12-character password with at least 3 numbers
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%';
    
    let password = '';
    
    // Add at least 3 numbers
    for (let i = 0; i < 3; i++) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    // Add at least 1 special character
    password += specials.charAt(Math.floor(Math.random() * specials.length));
    
    // Fill the rest with letters and numbers
    for (let i = password.length; i < 12; i++) {
      const useNumber = Math.random() > 0.7;
      if (useNumber) {
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
      } else {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleCreateAccount = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Generate bank ID for bank users
    let bankId = newUser.bankId;
    if (newUser.role === 'bank' && !bankId) {
      bankId = `bank${Date.now()}`;
    }

    const tempPassword = generateTemporaryPassword();
    const success = await createUserAccount(
      newUser.name,
      newUser.email,
      newUser.role,
      tempPassword,
      bankId
    );

    if (success) {
      setGeneratedPassword(tempPassword);
      setShowPassword(true);
      toast.success('Account created successfully!');
      setNewUser({ name: '', email: '', role: 'scheduler', bankId: '' });
    } else {
      toast.error('Failed to create account. Email may already exist.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      const success = await deleteUser(userId);
      if (success) {
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const copyPasswordToClipboard = () => {
    // Fallback method for clipboard copy (works when Clipboard API is blocked)
    const textArea = document.createElement('textarea');
    textArea.value = generatedPassword;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    // Focus and select only the textarea content
    textArea.focus();
    textArea.setSelectionRange(0, generatedPassword.length);
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Password copied to clipboard!');
      } else {
        toast.error('Failed to copy password. Please copy it manually.');
      }
    } catch (err) {
      toast.error('Failed to copy password. Please copy it manually.');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scheduler':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bank':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'engineer':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">User Account Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{regularUsers.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Schedulers</div>
            <div className="text-3xl font-bold text-blue-600">
              {regularUsers.filter(u => u.role === 'scheduler').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Banks</div>
            <div className="text-3xl font-bold text-green-600">
              {regularUsers.filter(u => u.role === 'bank').length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Engineers</div>
            <div className="text-3xl font-bold text-orange-600">
              {regularUsers.filter(u => u.role === 'engineer').length}
            </div>
          </Card>
        </div>

        {/* Create User Section */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create New User Account</h2>
              <p className="text-sm text-gray-600">Create accounts and generate temporary passwords for users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john.doe@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduler">Scheduler</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="engineer">Custom Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newUser.role === 'bank' && (
              <div>
                <Label htmlFor="bankId">Bank ID (Optional)</Label>
                <Input
                  id="bankId"
                  placeholder="Auto-generated if left empty"
                  value={newUser.bankId}
                  onChange={(e) => setNewUser({ ...newUser, bankId: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleCreateAccount} className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>
        </Card>

        {/* Password Display Dialog */}
        <Dialog open={showPassword} onOpenChange={setShowPassword}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Account Created Successfully!</DialogTitle>
              <DialogDescription>
                This password will not be shown again. Please send it to the user securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">
                  ⚠️ Important: Save this temporary password
                </p>
                <p className="text-xs text-amber-700">
                  This password will not be shown again. Please send it to the user securely.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <Label className="text-xs text-gray-600 mb-2 block">Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 font-mono text-sm">
                    {generatedPassword}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyPasswordToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>📧 Email: {newUser.email}</p>
                <p>👤 Role: {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}</p>
                <p className="mt-2 text-amber-700">The user will be required to change this password on first login.</p>
              </div>

              <Button onClick={() => setShowPassword(false)} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Users List */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(u.role as UserRole)}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isTemporaryPassword ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          Temporary Password
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}