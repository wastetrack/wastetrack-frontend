import { Lightbulb } from 'lucide-react';

export default function EcoTip() {
  return (
    <div>
      <div className="p-4 bg-white shadow-xs sm:shadow-sm rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-emerald-100">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-md text-left font-semibold text-gray-800">Tips Ramah Lingkungan</h2>
            <p className="text-xs text-left text-gray-500">
              Dengan memilah sampah secara tepat, Anda membantu proses daur ulang menjadi lebih efisien
              dan turut mengurangi jejak karbon, demi menciptakan lingkungan yang lebih sehat bagi bumi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
