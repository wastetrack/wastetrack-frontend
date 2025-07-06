import React from 'react';
import Image from 'next/image';

const BottomFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className='mx-auto px-14'>
        <div className='border-t border-gray-300 py-2'>
          <div className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0'>
            {/* Left side - Copyright */}
            <div className='flex items-center'>
              <p className='text-xs text-gray-400'>
                Hak Cipta © {currentYear} WasteTrack - Timses AITIES
              </p>
            </div>

            {/* Right side - Logo (bigger and independent) */}
            <div className='flex items-center'>
              <Image
                src='/icons/web-logo.svg'
                alt='WasteTrack Logo'
                width={180}
                height={45}
                className='h-18 w-auto'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomFooter;
