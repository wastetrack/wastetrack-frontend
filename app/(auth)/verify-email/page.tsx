'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle,
  Mail,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { emailVerificationFunctions } from '@/helpers/utils/verify-email/verify-email';
import { alerts } from '@/components/alerts/alerts';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'resend'
  >('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

  const handleVerification = useCallback(async (token: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');

      const result =
        await emailVerificationFunctions.handleEmailVerification(token);

      if (result.success) {
        setStatus('success');
        setMessage('Email verified successfully!');

        // Show success alert
        await alerts.emailVerificationSuccess();

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message);

        // Show error alert with the specific message
        await alerts.emailVerificationFailed(result.message);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('Verification failed. Please try again.');

      // Show generic error alert
      await alerts.emailVerificationFailed(
        'Verification failed. Please try again.'
      );
    }
  }, [router]);

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      handleVerification(token);
    } else if (emailParam) {
      setStatus('resend');
      setMessage('Enter your email to resend verification');
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [searchParams, handleVerification]);

  const handleResendVerification = async () => {
    if (!email || cooldownActive) return;

    try {
      setIsLoading(true);
      const result =
        await emailVerificationFunctions.handleResendVerification(email);

      if (result.success) {
        setCooldownActive(true);
        setCooldown(60);

        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              setCooldownActive(false);
              clearInterval(timer);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);

        startVerificationCheck();
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      await alerts.serverError();
    } finally {
      setIsLoading(false);
    }
  };

  const startVerificationCheck = () => {
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
    }

    checkInterval.current = setInterval(async () => {
      try {
        const result =
          await emailVerificationFunctions.checkEmailVerificationStatus(email);

        if (result.success && result.isVerified) {
          clearInterval(checkInterval.current!);
          setStatus('success');
          setMessage('Email verified successfully!');

          // Show success alert
          await alerts.emailVerificationSuccess();

          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (error) {
        // Silent fail for background check
        console.error('Background verification check error:', error);
      }
    }, 3000);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className='text-center'>
            <div className='mx-auto mb-6 h-16 w-16'>
              <RefreshCw className='h-16 w-16 animate-spin text-blue-500' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Verifying Email
            </h2>
            <p className='text-gray-600'>{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className='text-center'>
            <div className='mx-auto mb-6 h-16 w-16'>
              <CheckCircle className='h-16 w-16 text-green-500' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Email Verified!
            </h2>
            <p className='mb-4 text-gray-600'>{message}</p>
            <p className='text-sm text-gray-500'>
              Redirecting to login page...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className='text-center'>
            <div className='mx-auto mb-6 h-16 w-16'>
              <AlertCircle className='h-16 w-16 text-red-500' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Verification Failed
            </h2>
            <p className='mb-6 text-gray-600'>{message}</p>
            <div className='space-y-4'>
              <Link
                href='/login'
                className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Login
              </Link>
            </div>
          </div>
        );

      case 'resend':
        return (
          <div className='text-center'>
            <div className='mx-auto mb-6 h-16 w-16'>
              <Mail className='h-16 w-16 text-blue-500' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Verify Your Email
            </h2>
            <p className='mb-6 text-gray-600'>
              We&apos;ll send a verification link to your email address.
            </p>

            <div className='space-y-4'>
              <div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email address'
                  className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <button
                onClick={handleResendVerification}
                disabled={!email || cooldownActive || isLoading}
                className='flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400'
              >
                {isLoading ? (
                  <RefreshCw className='h-4 w-4 animate-spin' />
                ) : cooldownActive ? (
                  <>
                    <Clock className='mr-2 h-4 w-4' />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <Mail className='mr-2 h-4 w-4' />
                    Send Verification Email
                  </>
                )}
              </button>

              <Link
                href='/login'
                className='inline-flex items-center text-blue-600 transition-colors hover:text-blue-700'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Login
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
