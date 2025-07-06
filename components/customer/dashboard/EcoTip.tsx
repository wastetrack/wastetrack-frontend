import { Lightbulb } from 'lucide-react';

export default function EcoTip() {
  return (
    <div>
      <div className='shadow-xs rounded-xl bg-white p-4 sm:shadow-sm'>
        <div className='flex items-start gap-4'>
          <div className='rounded-lg bg-emerald-100 p-2'>
            <Lightbulb className='h-4 w-4 text-emerald-600 sm:h-5 sm:w-5' />
          </div>
          <div>
            <h2 className='text-md text-left font-semibold text-gray-800'>
              Tips Ramah Lingkungan
            </h2>
            <p className='text-left text-xs text-gray-500'>
              Dengan memilah sampah secara tepat, Anda membantu proses daur
              ulang menjadi lebih efisien dan turut mengurangi jejak karbon,
              demi menciptakan lingkungan yang lebih sehat bagi bumi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
