export const ROLES = {
  // admin: 'Super Admin',
  customer: 'Nasabah',
  waste_bank_unit: 'Bank Sampah Unit',
  waste_collector_unit: 'Pegawai BSU',
  waste_bank_central: 'Bank Sampah Induk',
  waste_collector_central: 'Pegawai BSI',
  industry: 'Offtaker', // Display as Offtaker but send as industry
  // government: 'Pemerintah',
};

export const ROLE_DESCRIPTIONS = {
  admin: 'Mengelola semua aspek sistem dan mengawasi seluruh pengguna.',
  waste_bank_unit: 'Bank sampah unit lokal untuk melayani masyarakat sekitar.',
  waste_collector_unit:
    'Pegawai bank sampah unit yang mengumpulkan sampah dari customer.',
  waste_bank_central:
    'Bank sampah pusat yang mengelola beberapa bank sampah unit.',
  waste_collector_central:
    'Pegawai bank sampah induk yang mengumpulkan sampah dari BSU.',
  customer: 'Kelola sampah rumah tangga Anda dan dapatkan hadiah.',
  industry: 'Akses bahan daur ulang dan kelola keberlanjutan.',
  government: 'Memantau dan menganalisis dampak lingkungan serta kebijakan.',
};
