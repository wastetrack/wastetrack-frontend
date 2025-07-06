import React from 'react';
import { Recycle, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='mt-auto border-t border-gray-200 bg-gray-50'>
      <div className='mx-auto max-w-6xl px-4 py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Brand Section */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Recycle className='h-8 w-8 text-emerald-600' />
              <h3 className='text-xl font-bold text-gray-900'>WasteTrack</h3>
            </div>
            <p className='text-sm leading-relaxed text-gray-600'>
              Sistem manajemen limbah yang efisien untuk masa depan yang lebih
              bersih dan berkelanjutan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='mb-4 text-lg font-semibold text-gray-900'>
              Tautan Cepat
            </h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Layanan
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className='mb-4 text-lg font-semibold text-gray-900'>
              Layanan
            </h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Bank Sampah
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Pengumpul Sampah
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Industri
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-sm text-gray-600 transition-colors duration-200 hover:text-emerald-600'
                >
                  Pemerintah
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className='mb-4 text-lg font-semibold text-gray-900'>Kontak</h4>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <Mail className='h-4 w-4 text-emerald-600' />
                <span className='text-sm text-gray-600'>
                  info@wastetrack.id
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <Phone className='h-4 w-4 text-emerald-600' />
                <span className='text-sm text-gray-600'>
                  +62 (021) 1234-5678
                </span>
              </div>
              <div className='flex items-center space-x-3'>
                <MapPin className='h-4 w-4 text-emerald-600' />
                <span className='text-sm text-gray-600'>
                  Jakarta, Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='mt-8 border-t border-gray-200 pt-8'>
          <div className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0'>
            <p className='text-sm text-gray-500'>
              © {currentYear} WasteTrack. Semua hak dilindungi.
            </p>
            <div className='flex space-x-6'>
              <a
                href='#'
                className='text-sm text-gray-500 transition-colors duration-200 hover:text-emerald-600'
              >
                Kebijakan Privasi
              </a>
              <a
                href='#'
                className='text-sm text-gray-500 transition-colors duration-200 hover:text-emerald-600'
              >
                Syarat & Ketentuan
              </a>
              <a
                href='#'
                className='text-sm text-gray-500 transition-colors duration-200 hover:text-emerald-600'
              >
                Bantuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
