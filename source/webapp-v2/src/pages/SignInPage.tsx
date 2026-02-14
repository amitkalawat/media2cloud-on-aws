import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SignInForm } from '@/components/auth/SignInForm';
import { NewPasswordForm } from '@/components/auth/NewPasswordForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Logo } from '@/components/layout/Logo';
import type { ChallengeResponse } from '@/lib/cognito';

type AuthView = 'signin' | 'new-password' | 'forgot-password';

export default function SignInPage() {
  const [view, setView] = useState<AuthView>('signin');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, completeNewPassword, forgotPassword, confirmForgotPassword, isAuthenticated, tryAutoSignIn } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/collection';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }
    tryAutoSignIn().then((success) => {
      if (success) navigate(from, { replace: true });
    });
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn(username, password);
      if (result) {
        setChallenge(result);
        setView('new-password');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPassword = async (newPassword: string) => {
    if (!challenge) return;
    setError(null);
    setIsLoading(true);
    try {
      await completeNewPassword(challenge.username, newPassword, challenge.session);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to set new password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (username: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(username);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmForgotPassword = async (username: string, code: string, newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await confirmForgotPassword(username, code, newPassword);
      setResetSuccess(true);
      setView('signin');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const viewTitle = {
    'signin': 'Welcome back',
    'new-password': 'Set New Password',
    'forgot-password': 'Reset Password',
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent/5 via-accent-light to-background items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="font-serif text-5xl text-text mb-4">
            Media Intelligence
          </h2>
          <p className="text-lg text-text-secondary">
            Automated AI/ML analysis for your video, audio, image, and document assets.
          </p>
        </div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-surface p-10 shadow-sm">
            <div className="mb-8 flex justify-center">
              <Logo />
            </div>

            <h1 className="mb-6 text-center font-serif text-2xl">
              {viewTitle[view]}
            </h1>

            {resetSuccess && view === 'signin' && (
              <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
                Password reset successful. Please sign in with your new password.
              </div>
            )}

            {view === 'signin' && (
              <SignInForm
                onSubmit={handleSignIn}
                onForgotPassword={() => {
                  setView('forgot-password');
                  setError(null);
                }}
                error={error}
                isLoading={isLoading}
              />
            )}

            {view === 'new-password' && (
              <NewPasswordForm
                onSubmit={handleNewPassword}
                error={error}
                isLoading={isLoading}
              />
            )}

            {view === 'forgot-password' && (
              <ForgotPasswordForm
                onSendCode={handleForgotPassword}
                onConfirm={handleConfirmForgotPassword}
                onBack={() => {
                  setView('signin');
                  setError(null);
                }}
                error={error}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
