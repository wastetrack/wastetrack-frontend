'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Mail, AlertCircle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { emailVerificationFunctions } from '../../../services/functions/email-verif-function/email-verification-function';
import { alerts } from '../../../components/alerts/alerts';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

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
  }, [searchParams]);

  const handleVerification = async (token: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');

      const result = await emailVerificationFunctions.handleEmailVerification(token);

      if (result.success) {
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Show success alert
        await alerts.emailVerificationSuccess();
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message);
        
        // Show error alert with the specific message
        await alerts.emailVerificationFailed(result.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
      
      // Show generic error alert
      await alerts.emailVerificationFailed('Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email || cooldownActive) return;

    try {
      setIsLoading(true);
      const result = await emailVerificationFunctions.handleResendVerification(email);

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
        const result = await emailVerificationFunctions.checkEmailVerificationStatus(email);
        
        if (result.success && result.isVerified) {
          clearInterval(checkInterval.current!);
          setStatus('success');
          setMessage('Email verified successfully!');
          
          // Show success alert
          await alerts.emailVerificationSuccess();
          
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      } catch (error) {
        // Silent fail for background check
      }
    }, 3000);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-6">
              <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        );

      case 'resend':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-6">
              <Mail className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
            <p className="text-gray-600 mb-6">
              We'll send a verification link to your email address.
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleResendVerification}
                disabled={!email || cooldownActive || isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : cooldownActive ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Email
                  </>
                )}
              </button>

              <Link
                href="/auth/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
