'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw } from 'lucide-react';
import { forgotPasswordFunctions } from '../../../services/functions/forgot-password-function/forgot-password-function';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await forgotPasswordFunctions.handleForgotPassword(email);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '-24px' }}>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
                    <div>
                        <h2 className="text-center text-2xl font-bold text-gray-800">
                            Lupa Password
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Masukkan email Anda untuk mereset password
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="text-left block mb-2 text-sm font-medium text-gray-500">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="text-sm w-full p-3 pl-10 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400"
                                    placeholder="Masukkan email Anda"
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full p-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
                                ) : (
                                    'Kirim Link Reset Password'
                                )}
                            </button>
                        </div>
                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Kembali ke Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
