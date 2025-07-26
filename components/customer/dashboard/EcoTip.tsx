import { Lightbulb } from 'lucide-react';

export default function EcoTip() {
  return (
    <div>
      <div className='shadow-xs rounded-xl border border-gray-200 bg-white p-4 sm:shadow-sm'>
        <div className='flex items-start gap-4'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-emerald-100 p-2'>
              <Lightbulb className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
            </div>
          </div>
          <div className='flex flex-col justify-center'>
            <h2 className='text-md mt-1 text-left font-semibold text-gray-800'>
              Tips Ramah Lingkungan
            </h2>
            <p className='mt-2 text-left text-[13px] text-gray-500'>
              Dengan memilah sampah secara tepat, Anda membantu proses daur
              ulang menjadi lebih efisien dan turut mengurangi jejak karbon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
