
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ScreenContainer from './ScreenContainer';

interface AuthPageProps {
  onBack: () => void;
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onAuthSuccess }) => {
  const [activeForm, setActiveForm] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSuccess = (successMessage?: string) => {
    if (successMessage) {
      setMessage(successMessage);
      setMessageType('success');
    } else {
      onAuthSuccess();
    }
  };

  const handleError = (errorMessage: string) => {
    setMessage(errorMessage);
    setMessageType('error');
  };

  const clearMessage = () => {
    setMessage('');
  };

  return (
    <ScreenContainer className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={onBack} className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Welcome to RenewMe</h1>
            <p className="text-text-secondary">
              {activeForm === 'signin' ? 'Sign in to manage your renewals' : 'Create your account to get started'}
            </p>
          </div>
        </div>

        {activeForm === 'signin' ? (
          <SignInForm
            onSuccess={handleSuccess}
            onError={handleError}
            onSwitchToSignUp={() => {
              setActiveForm('signup');
              clearMessage();
            }}
          />
        ) : (
          <SignUpForm
            onSuccess={handleSuccess}
            onError={handleError}
            onSwitchToSignIn={() => {
              setActiveForm('signin');
              clearMessage();
            }}
          />
        )}
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};

export default AuthPage;
