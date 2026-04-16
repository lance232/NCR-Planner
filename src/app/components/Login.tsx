import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar, Shield, Users, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ChangePassword } from './ChangePassword';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has temporary password
      if (user.isTemporaryPassword) {
        setShowChangePassword(true);
        return;
      }
      
      // Navigate to role-specific dashboard
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'scheduler') {
        navigate('/scheduler', { replace: true });
      } else if (user.role === 'bank') {
        navigate('/bank', { replace: true });
      } else if (user.role === 'engineer') {
        navigate('/engineer', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Handle successful password change
  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    // Navigate to dashboard after password change
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'scheduler') {
        navigate('/scheduler', { replace: true });
      } else if (user.role === 'bank') {
        navigate('/bank', { replace: true });
      } else if (user.role === 'engineer') {
        navigate('/engineer', { replace: true });
      }
    }
  };

  // Show password change screen if user has temporary password
  if (showChangePassword && user?.isTemporaryPassword) {
    return <ChangePassword onSuccess={handlePasswordChangeSuccess} />;
  }

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        // useEffect will handle navigation
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding and Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold">NCR Planner</h1>
          </div>
          
          <div className="space-y-8 mt-16">
            <div className="flex gap-4">
              <div className="bg-white/20 p-3 rounded-lg h-fit">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-blue-100">
                  Coordinate schedules between schedulers, banks, and engineers seamlessly. 
                  View bank availability in real-time through our professional calendar interface.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/20 p-3 rounded-lg h-fit">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-blue-100">
                  Each bank's schedule is kept private and secure. Banks can only view and manage their own availability.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/20 p-3 rounded-lg h-fit">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Multi-Role Access</h3>
                <p className="text-blue-100">
                  Dedicated dashboards for schedulers, banks, and custom engineers. Each role has tailored features for their workflow.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-100">
          <p>&copy; 2026 NCR Planner. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">NCR Planner</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Login to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : 'Login'}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    📧 Account Access
                  </p>
                  <p className="text-xs text-blue-700">
                    User accounts are created and managed by system administrators. If you need access, please contact your administrator.
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">Demo Accounts:</p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p>👤 <strong>Admin:</strong> admin@ncrplanner.com / admin123</p>
                    <p>📅 <strong>Scheduler:</strong> scheduler@example.com / scheduler123</p>
                    <p>🏦 <strong>Bank:</strong> bank@example.com / bank123</p>
                    <p>🔧 <strong>Engineer:</strong> engineer@example.com / engineer123</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}