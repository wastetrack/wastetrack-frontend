import { RefreshCw } from 'lucide-react';

export default function VerifyEmailLoading() {
  return (
    <div className='flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          <div className='text-center'>
            <div className='mx-auto mb-6 h-16 w-16'>
              <RefreshCw className='h-16 w-16 animate-spin text-blue-500' />
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>
              Loading...
            </h2>
            <p className='text-gray-600'>Please wait a moment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
