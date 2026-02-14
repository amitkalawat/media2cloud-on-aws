import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ForgotPasswordFormProps {
  onSendCode: (username: string) => Promise<void>;
  onConfirm: (username: string, code: string, newPassword: string) => Promise<void>;
  onBack: () => void;
  error: string | null;
  isLoading: boolean;
}

export function ForgotPasswordForm({
  onSendCode,
  onConfirm,
  onBack,
  error,
  isLoading,
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSendCode(username);
    setStep('code');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    await onConfirm(username, code, newPassword);
  };

  const displayError = validationError || error;

  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-5">
        <p className="text-sm text-text-secondary">
          Enter your username to receive a password reset code.
        </p>

        <div className="space-y-2">
          <label htmlFor="forgotUsername" className="text-sm font-medium text-text">
            Username
          </label>
          <Input
            id="forgotUsername"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>

        {displayError && (
          <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            {displayError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending code...' : 'Send Reset Code'}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-text-secondary hover:text-accent transition-colors"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      <p className="text-sm text-text-secondary">
        Enter the verification code sent to your email and your new password.
      </p>

      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium text-text">
          Verification Code
        </label>
        <Input
          id="code"
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="resetNewPassword" className="text-sm font-medium text-text">
          New Password
        </label>
        <Input
          id="resetNewPassword"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="resetConfirmPassword" className="text-sm font-medium text-text">
          Confirm Password
        </label>
        <Input
          id="resetConfirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {displayError && (
        <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {displayError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Resetting password...' : 'Reset Password'}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-text-secondary hover:text-accent transition-colors"
      >
        Back to sign in
      </button>
    </form>
  );
}
