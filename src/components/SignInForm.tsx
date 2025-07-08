
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LogIn, Mail, Lock } from 'lucide-react';
import { AuthService, SignInData } from '@/services/authService';

interface SignInFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onSwitchToSignUp: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onError, onSwitchToSignUp }) => {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await AuthService.signIn(formData);
    
    if (result.success) {
      onSuccess();
    } else {
      onError(result.error!);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: keyof SignInData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };

  return (
    <Card className="card-shadow bg-card-bg">
      <CardHeader>
        <CardTitle className="text-center text-text-primary flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          Welcome Back
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="signin-email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              placeholder="Enter your email"
              className="bg-card-bg border-primary-accent/20 focus:border-primary-accent"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signin-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="signin-password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              placeholder="Enter your password"
              className="bg-card-bg border-primary-accent/20 focus:border-primary-accent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember-me"
              checked={formData.rememberMe}
              onCheckedChange={handleRememberMeChange}
            />
            <Label htmlFor="remember-me" className="text-sm text-text-secondary cursor-pointer">
              Keep me signed in
            </Label>
          </div>
          
          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary-accent hover:underline text-sm"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
