'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import RegisterForm from '../../../components/register-form/register-form';
import { registerApi } from '../../../services/api/register-api/register-api';
import {
    FormData,
    validateForm,
    transformFormDataToApi,
    getRedirectPath
} from '../../../services/functions/register-function/register-function';
import { alerts } from '../../../components/alerts/alerts';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        fullName: '',
        phone: '',
        phoneClean: '',
        institution: '',
        address: '',
        city: '',
        province: '',
        coordinates: null
    });

    const handleFormDataChange = (newFormData: FormData) => {
        setFormData(newFormData);
        if (error) setError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
            setError(validationErrors[0]);
            await alerts.validationError(validationErrors.join(', '));
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Show loading alert
            alerts.loading('Membuat akun...');

            // Transform and send data
            const apiData = transformFormDataToApi(formData);
            const response = await registerApi.register(apiData);

            // Close loading and show success with username
            alerts.close();
            await alerts.registrationSuccess(formData.fullName);

            // Redirect based on role
            const redirectPath = getRedirectPath(formData.role);
            router.push(redirectPath);

        } catch (err) {
            alerts.close();
            console.error('Registration error:', err);

            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';

            // Handle specific error cases with reusable alerts
            if (errorMessage.toLowerCase().includes('email') && (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exist'))) {
                setError('Email sudah terdaftar');
                const result = await alerts.emailAlreadyExists();
                if (result.isConfirmed) {
                    router.push('/login');
                }
                // } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                //   setError('Masalah koneksi');
                //   await alerts.networkError();
            } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
                setError('Data tidak valid');
                await alerts.validationError(errorMessage);
            } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
                setError('Server bermasalah');
                await alerts.serverError();
            } else {
                setError(errorMessage);
                await alerts.genericError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center font-poppins bg-gray-50">
            <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-sm">
                {/* Header Icon */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center mb-4 rounded-full h-12 w-12 bg-emerald-100">
                        <UserPlus size={24} className="text-emerald-600" />
                    </div>
                </div>

                {/* Register Form */}
                <RegisterForm
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                />

                {/* Login Link */}
                <p className="mt-6 text-xs text-center text-gray-700 sm:text-sm">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 sm:text-sm">
                        Masuk
                    </Link>
                </p>
            </div>
        </main>
    );
}
