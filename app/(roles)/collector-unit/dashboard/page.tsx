'use client';
import { LogoutButton } from '@/components/logout-button/logout-button';

export default function CollectorUnitDashboard() {
  return (
    <div className='p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Collector Unit Dashboard</h1>
        <LogoutButton />
      </div>
      <p className='mt-2'>Welcome to the Collector Unit dashboard.</p>
    </div>
  );
}
