import { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Building2, Wrench } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>('scheduler');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password, activeRole);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    } else {
      // Navigate to the appropriate dashboard based on role
      switch (activeRole) {
        case 'scheduler':
          navigate('/scheduler');
          break;
        case 'bank':
          navigate('/bank');
          break;
        case 'engineer':
          navigate('/engineer');
          break;
      }
    }
  };

  const roleInfo = {
    scheduler: {
      icon: Calendar,
      title: 'Scheduler Login',
      description: 'Create and manage booking requests',
      defaultEmail: 'scheduler@example.com',
      defaultPassword: 'scheduler123',
    },
    bank: {
      icon: Building2,
      title: 'Bank Login',
      description: 'Review and approve booking requests',
      defaultEmail: 'bank@example.com',
      defaultPassword: 'bank123',
    },
    engineer: {
      icon: Wrench,
      title: 'Custom Engineer Login',
      description: 'View assigned bookings and complete tasks',
      defaultEmail: 'engineer@example.com',
      defaultPassword: 'engineer123',
    },
  };

  const currentRole = roleInfo[activeRole];
  const Icon = currentRole.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Booking System</CardTitle>
          <CardDescription>Select your role and sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
              <TabsTrigger value="bank">Bank</TabsTrigger>
              <TabsTrigger value="engineer">Engineer</TabsTrigger>
            </TabsList>

            <TabsContent value={activeRole} className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                  <Icon className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h3 className="font-medium text-sm">{currentRole.title}</h3>
                    <p className="text-xs text-gray-600">{currentRole.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={currentRole.defaultEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Sign In
                </Button>

                <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                  <p className="font-medium mb-1">Demo Credentials:</p>
                  <p>Email: {currentRole.defaultEmail}</p>
                  <p>Password: {currentRole.defaultPassword}</p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}