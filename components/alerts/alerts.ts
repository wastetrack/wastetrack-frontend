import Swal from 'sweetalert2';

export const alerts = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      background: '#f0fff4',
      color: '#333',
      iconColor: '#10b981',
      timer: 8000, // Increased from 5000
      showConfirmButton: false,
      customClass: {
        popup:
          'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg shadow-lg',
        title: 'text-base sm:text-xl font-semibold text-gray-800',
        htmlContainer: 'text-sm sm:text-base text-gray-600',
      },
    });
  },

  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      background: '#fff5f5',
      color: '#333',
      iconColor: '#ef4444',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Mengerti',
      customClass: {
        popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
        title: 'text-xl sm:text-2xl font-semibold text-gray-800',
        htmlContainer: 'text-sm sm:text-base text-gray-600',
        confirmButton: 'text-sm sm:text-base',
      },
    });
  },

  // Test function to verify alerts are working
  test: () => {
    try {
      return Swal.fire({
        icon: 'info',
        title: 'Alert Test 🧪',
        html: `
          <div class="text-left space-y-3">
            <p class="text-gray-600">Jika Anda melihat alert ini, berarti sistem alert berfungsi dengan baik!</p>
            <div class="bg-green-50 p-3 rounded-lg">
              <p class="text-sm text-green-700">✅ SweetAlert2 berhasil dimuat</p>
            </div>
          </div>
        `,
        confirmButtonText: 'Oke, Mantap!',
        confirmButtonColor: '#10b981',
      });
    } catch (error) {
      console.error('Alert test failed:', error);
      alert('Alert test - Basic fallback working');
    }
  },

  // Specific alert for invalid email
  invalidEmail: () => {
    return Swal.fire({
      icon: 'error',
      title: 'Email Tidak Terdaftar 📧',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Hmm, sepertinya email yang Anda masukkan belum terdaftar di sistem kami.</p>
          
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p class="text-sm font-medium text-blue-800 mb-2">💡 Apa yang bisa Anda lakukan:</p>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• <strong>Periksa ejaan</strong> - Pastikan tidak ada typo</li>
              <li>• <strong>Coba email lain</strong> - Mungkin Anda daftar dengan email berbeda</li>
              <li>• <strong>Daftar sekarang</strong> - Jika memang belum punya akun</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-xs text-gray-600">💬 Butuh bantuan? Hubungi tim support kami</p>
          </div>
        </div>
      `,
      background: '#fff5f5',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Coba Email Lain',
      showCancelButton: true,
      cancelButtonText: 'Daftar Akun',
      cancelButtonColor: '#10b981',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
        cancelButton: 'text-sm font-medium',
      },
    });
  },

  // Specific alert for wrong password
  invalidPassword: () => {
    return Swal.fire({
      icon: 'error',
      title: 'Password Salah 🔐',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Oops! Password yang Anda masukkan tidak sesuai dengan akun ini.</p>
          
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p class="text-sm font-medium text-yellow-800 mb-2">⚠️ Tips untuk mencoba lagi:</p>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Caps Lock</strong> - Pastikan tidak aktif</li>
              <li>• <strong>Spasi</strong> - Jangan ada spasi di awal/akhir</li>
              <li>• <strong>Karakter khusus</strong> - Perhatikan simbol yang digunakan</li>
            </ul>
          </div>
          
          <div class="bg-red-50 p-3 rounded-lg">
            <p class="text-xs text-red-700">🔒 Demi keamanan, akun akan terkunci sementara setelah beberapa kali percobaan gagal</p>
          </div>
        </div>
      `,
      background: '#fff5f5',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Coba Lagi',
      showCancelButton: true,
      cancelButtonText: 'Lupa Password?',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
        cancelButton: 'text-sm font-medium',
      },
    });
  },

  // Alert for too many active sessions
  sessionLimit: () => {
    return Swal.fire({
      icon: 'warning',
      title: 'Batas Login Terlampaui! 🚫',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Waduh! Anda sudah login di terlalu banyak perangkat atau browser sekaligus.</p>
          
          <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <p class="text-sm font-medium text-orange-800 mb-2">🔐 Yang perlu Anda lakukan:</p>
            <ul class="text-sm text-orange-700 space-y-1">
              <li>• <strong>Logout</strong> dari perangkat/browser lain yang tidak digunakan</li>
              <li>• <strong>Tutup tab</strong> browser yang masih login</li>
              <li>• <strong>Tunggu 5-10 menit</strong> lalu coba lagi</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">💡 Fitur ini melindungi akun Anda dari penggunaan yang tidak sah</p>
          </div>
        </div>
      `,
      background: '#fffbeb',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Saya Mengerti',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // Updated: Email not verified alert with email parameter and resend option
  emailNotVerified: (email: string) => {
    return Swal.fire({
      icon: 'warning',
      title: 'Email Belum Diverifikasi 📬',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Email <strong>${email}</strong> belum diverifikasi. Anda harus memverifikasi email terlebih dahulu untuk dapat login.</p>
          
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p class="text-sm font-medium text-blue-800 mb-2">📧 Langkah verifikasi:</p>
            <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Buka aplikasi email Anda</li>
              <li>Cari email dari WasteTrack (cek folder spam juga)</li>
              <li>Klik link "Verifikasi Email"</li>
              <li>Kembali ke halaman login</li>
            </ol>
          </div>
          
          <div class="bg-yellow-50 p-3 rounded-lg">
            <p class="text-xs text-yellow-700">⏰ Link verifikasi berlaku selama 24 jam</p>
          </div>
        </div>
      `,
      background: '#f0f9ff',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Kirim Ulang Email Verifikasi',
      showCancelButton: true,
      cancelButtonText: 'Nanti Saja',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
        cancelButton: 'text-sm font-medium',
      },
    });
  },

  // New: Email verification sent successfully
  emailVerificationSent: () => {
    return Swal.fire({
      icon: 'success',
      title: 'Email Verifikasi Terkirim! 📧',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Email verifikasi berhasil dikirim ke kotak masuk Anda.</p>
          
          <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <p class="text-sm font-medium text-green-800 mb-2">✅ Langkah selanjutnya:</p>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Buka aplikasi email Anda</li>
              <li>• Cari email dari WasteTrack</li>
              <li>• Klik link verifikasi</li>
              <li>• Kembali untuk login</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">💡 Tidak menerima email? Cek folder spam atau tunggu beberapa menit</p>
          </div>
        </div>
      `,
      background: '#f0fff4',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Saya Mengerti',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Email verification success
  emailVerificationSuccess: () => {
    return Swal.fire({
      icon: 'success',
      title: 'Email Berhasil Diverifikasi! ✅',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Selamat! Email Anda telah berhasil diverifikasi.</p>
          
          <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <p class="text-sm font-medium text-green-800 mb-2">🎉 Apa yang bisa Anda lakukan sekarang:</p>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Login ke akun Anda</li>
              <li>• Akses semua fitur WasteTrack</li>
              <li>• Mulai mengelola sampah dengan efisien</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">🚀 Anda akan dialihkan ke halaman login dalam beberapa detik</p>
          </div>
        </div>
      `,
      background: '#f0fff4',
      timer: 5000,
      showConfirmButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Lanjut ke Login',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Email verification failed
  emailVerificationFailed: (message: string) => {
    return Swal.fire({
      icon: 'error',
      title: 'Verifikasi Email Gagal ❌',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Maaf, terjadi kesalahan saat memverifikasi email Anda.</p>
          
          <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <p class="text-sm font-medium text-red-800 mb-2">❌ Error:</p>
            <p class="text-sm text-red-700">${message}</p>
          </div>
          
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p class="text-sm font-medium text-yellow-800 mb-2">🔧 Solusi yang bisa dicoba:</p>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• Periksa link verifikasi di email</li>
              <li>• Minta kirim ulang email verifikasi</li>
              <li>• Pastikan link masih berlaku (24 jam)</li>
            </ul>
          </div>
        </div>
      `,
      background: '#fff5f5',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Coba Lagi',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Email verification resend cooldown
  emailVerificationCooldown: (remainingTime: number) => {
    return Swal.fire({
      icon: 'info',
      title: 'Tunggu Sebentar ⏰',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Anda baru saja meminta email verifikasi. Silakan tunggu sebelum meminta lagi.</p>
          
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p class="text-sm font-medium text-blue-800 mb-2">⏰ Waktu tunggu:</p>
            <p class="text-sm text-blue-700">Anda dapat meminta email verifikasi lagi dalam <strong>${remainingTime} detik</strong></p>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-xs text-gray-600">💡 Fitur ini mencegah spam dan melindungi server kami</p>
          </div>
        </div>
      `,
      background: '#f0f9ff',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Saya Mengerti',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  loading: (title: string = 'Memproses...') => {
    try {
      return Swal.fire({
        title,
        html: '<div class="text-sm text-gray-600">Mohon tunggu sebentar</div>',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } catch (error) {
      console.error('Loading alert error:', error);
    }
  },

  close: () => {
    try {
      Swal.close();
    } catch (error) {
      console.error('Close alert error:', error);
    }
  },

  confirm: (title: string, text?: string) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      background: '#fff9e8',
      color: '#333',
      iconColor: '#f59e0b',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      confirmButtonColor: '#f59e0b',
      cancelButtonText: 'Batal',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'w-[90%] max-w-sm sm:max-w-md rounded-md sm:rounded-lg',
        title: 'text-base sm:text-xl font-semibold text-gray-800',
        htmlContainer: 'text-sm sm:text-base text-gray-600',
        confirmButton: 'text-sm font-medium sm:text-base',
        cancelButton: 'text-sm font-medium sm:text-base',
      },
    });
  },

  // New: Server error alert
  serverError: () => {
    return Swal.fire({
      icon: 'error',
      title: 'Server Sedang Bermasalah 🔧',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Maaf, server kami sedang mengalami gangguan sementara.</p>
          
          <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <p class="text-sm font-medium text-orange-800 mb-2">⚙️ Yang bisa Anda lakukan:</p>
            <ul class="text-sm text-orange-700 space-y-1">
              <li>• <strong>Tunggu sebentar</strong> (2-5 menit) lalu coba lagi</li>
              <li>• <strong>Refresh halaman</strong> beberapa kali</li>
              <li>• <strong>Coba lagi nanti</strong> jika masih bermasalah</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">🔄 Tim teknis kami akan segera memperbaiki masalah ini</p>
          </div>
        </div>
      `,
      background: '#fff9e8',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Coba Lagi',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Validation error alert
  validationError: (message: string) => {
    return Swal.fire({
      icon: 'warning',
      title: 'Data Tidak Valid ⚠️',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Ada kesalahan dalam data yang Anda masukkan:</p>
          
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p class="text-sm font-medium text-yellow-800 mb-2">📝 Kesalahan:</p>
            <p class="text-sm text-yellow-700">${message}</p>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">💡 Periksa kembali form dan pastikan semua data sudah benar</p>
          </div>
        </div>
      `,
      background: '#fffbeb',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Perbaiki Data',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Generic error with more helpful message
  genericError: (message: string) => {
    return Swal.fire({
      icon: 'error',
      title: 'Ada Kendala Nih! 😅',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Terjadi masalah yang tidak terduga:</p>
          
          <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <p class="text-sm font-medium text-red-800 mb-2">❌ Error:</p>
            <p class="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">${message}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm font-medium text-gray-800 mb-2">🛠️ Solusi yang bisa dicoba:</p>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Refresh halaman and coba lagi</li>
              <li>• Periksa koneksi internet</li>
            </ul>
          </div>
        </div>
      `,
      background: '#fff5f5',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Coba Lagi',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Registration success alert
  registrationSuccess: (username: string) => {
    return Swal.fire({
      icon: 'success',
      title: 'Akun Berhasil Dibuat! 🎉',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Selamat datang di WasteTrack, <strong>${username}</strong>!</p>
          
          <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <p class="text-sm font-medium text-green-800 mb-2">✅ Akun berhasil dibuat:</p>
            <ul class="text-sm text-green-700 space-y-1">
              <li>• Profil Anda telah tersimpan</li>
              <li>• Anda dapat langsung menggunakan aplikasi</li>
              <li>• Nikmati fitur-fitur WasteTrack</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">🚀 Anda akan dialihkan ke dashboard dalam beberapa detik</p>
          </div>
        </div>
      `,
      background: '#f0fff4',
      timer: 5000,
      showConfirmButton: false,
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
      },
    });
  },

  // New: Email already exists alert
  emailAlreadyExists: () => {
    return Swal.fire({
      icon: 'error',
      title: 'Email Sudah Terdaftar 📧',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Email yang Anda masukkan sudah terdaftar di sistem kami.</p>
          
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p class="text-sm font-medium text-blue-800 mb-2">💡 Apa yang bisa Anda lakukan:</p>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• <strong>Login</strong> - Jika ini email Anda</li>
              <li>• <strong>Gunakan email lain</strong> - Untuk akun baru</li>
              <li>• <strong>Reset password</strong> - Jika lupa password</li>
            </ul>
          </div>
        </div>
      `,
      background: '#fff5f5',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Coba Login',
      showCancelButton: true,
      cancelButtonText: 'Gunakan Email Lain',
      cancelButtonColor: '#10b981',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
        cancelButton: 'text-sm font-medium',
      },
    });
  },

  // New: Location permission denied alert
  locationPermissionDenied: () => {
    return Swal.fire({
      icon: 'warning',
      title: 'Akses Lokasi Ditolak 📍',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Untuk melanjutkan pendaftaran, kami memerlukan akses lokasi Anda.</p>
          
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p class="text-sm font-medium text-yellow-800 mb-2">🔧 Cara mengaktifkan lokasi:</p>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• Klik ikon <strong>kunci/lokasi</strong> di address bar</li>
              <li>• Pilih <strong>"Allow"</strong> atau <strong>"Izinkan"</strong></li>
              <li>• Refresh halaman dan coba lagi</li>
            </ul>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-xs text-blue-700">🔒 Data lokasi Anda aman dan hanya digunakan untuk keperluan layanan</p>
          </div>
        </div>
      `,
      background: '#fffbeb',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Coba Lagi',
      customClass: {
        popup: 'w-[90%] max-w-md rounded-lg',
        title: 'text-lg font-semibold text-gray-800',
        htmlContainer: 'text-sm',
        confirmButton: 'text-sm font-medium',
      },
    });
  },

  // New: Registration success with email verification alert
  registrationSuccessWithVerification: async (
    fullName: string,
    email: string
  ) => {
    return await Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
      html: `
        <p>Welcome <strong>${fullName}</strong>!</p>
        <p>We've sent a verification email to <strong>${email}</strong></p>
        <p>Please check your email and click the verification link to activate your account.</p>
      `,
      confirmButtonText: 'Continue to Verification',
      confirmButtonColor: '#10b981',
      allowOutsideClick: false,
    });
  },

  // Auth Related Alerts
  passwordMismatch: () => {
    return Swal.fire({
      icon: 'error',
      title: 'Password Tidak Cocok',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Password yang Anda masukkan tidak sama.</p>
          
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            <p class="text-sm font-medium text-yellow-800">⚠️ Pastikan:</p>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• Password baru dan konfirmasi harus sama persis</li>
              <li>• Perhatikan huruf besar/kecil</li>
              <li>• Tidak ada spasi di awal atau akhir</li>
            </ul>
          </div>
        </div>
      `,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Coba Lagi',
    });
  },

  resetPasswordSuccess: () => {
    return Swal.fire({
      icon: 'success',
      title: 'Password Berhasil Diubah',
      text: 'Silakan login dengan password baru Anda',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Login Sekarang',
    });
  },

  resetPasswordLinkSent: (email: string) => {
    return Swal.fire({
      icon: 'success',
      title: 'Link Reset Password Terkirim',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Kami telah mengirim link reset password ke email <strong>${email}</strong></p>
          
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p class="text-sm font-medium text-blue-800">📧 Langkah selanjutnya:</p>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Cek inbox email Anda</li>
              <li>• Klik link reset password</li>
              <li>• Buat password baru</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg mt-3">
            <p class="text-xs text-gray-600">💡 Link berlaku selama 1 jam</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Mengerti',
    });
  },

  invalidResetToken: () => {
    return Swal.fire({
      icon: 'error',
      title: 'Link Tidak Valid',
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-600 mb-3">Link reset password tidak valid atau sudah kadaluarsa.</p>
          
          <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <p class="text-sm text-red-700">Silakan minta link reset password baru</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Minta Link Baru',
    });
  },
};

// Export a test function to verify alerts work
export const testAlerts = () => {
  console.log('Testing alerts...');
  alerts.test();
};

// Check if SweetAlert2 is loaded properly
// if (typeof window !== 'undefined') {
//   if (!Swal) {
//     console.error('SweetAlert2 is not loaded properly!');
//     throw new Error('SweetAlert2 initialization failed');
//   } else {
//     console.log('SweetAlert2 loaded successfully');
//   }
// }

// Add error handling wrapper
const handleAlertError = (error: any, fallbackMessage: string) => {
  console.error('Alert error:', error);
  // Fallback to basic browser alert
  alert(fallbackMessage);
};
