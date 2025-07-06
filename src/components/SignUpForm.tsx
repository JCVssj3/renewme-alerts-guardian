
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, User, Mail, Lock } from 'lucide-react';
import { AuthService, SignUpData } from '@/services/authService';

interface SignUpFormProps {
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onSwitchToSignIn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onError, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState<SignUpData>({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password.length < 6) {
      onError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await AuthService.signUp(formData);
    
    if (result.success) {
      onSuccess(result.message!);
    } else {
      onError(result.error!);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: keyof SignUpData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card className="card-shadow bg-card-bg">
      <CardHeader>
        <CardTitle className="text-center text-text-primary flex items-center justify-center gap-2">
          <User className="h-5 w-5" />
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
              required
              placeholder="Enter your full name"
              className="bg-card-bg border-primary-accent/20 focus:border-primary-accent"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              placeholder="Enter your email"
              className="bg-card-bg border-primary-accent/20 focus:border-primary-accent"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              minLength={6}
              placeholder="Create a password (min. 6 characters)"
              className="bg-card-bg border-primary-accent/20 focus:border-primary-accent"
            />
          </div>
          
          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary-accent hover:underline text-sm"
          >
            Already have an account? Sign In
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
