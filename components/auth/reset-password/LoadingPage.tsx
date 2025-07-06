import { RefreshCw } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div style={{ margin: '-24px' }}>
      <div className='flex min-h-screen items-center justify-center bg-gray-100'>
        <div className='w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center shadow'>
          <RefreshCw className='mx-auto h-8 w-8 animate-spin text-emerald-600' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    </div>
  );
}
