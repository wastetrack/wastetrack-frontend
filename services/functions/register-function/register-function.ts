import { alerts } from '../../../component/alerts/alerts';

export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  fullName: string;
  phone: string;
  institution: string;
  address: string;
  city: string;
  province: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export const ROLES = {
  admin: "Super Admin",
  waste_bank_unit: "Bank Sampah Unit",
  waste_collector_unit: "Pegawai BSU", 
  waste_bank_central: "Bank Sampah Induk",
  waste_collector_central: "Pegawai BSI",
  customer: "Nasabah",
  industry: "Offtaker", // Display as Offtaker but send as industry
  government: "Pemerintah"
};

export const ROLE_DESCRIPTIONS = {
  admin: "Mengelola semua aspek sistem dan mengawasi seluruh pengguna.",
  waste_bank_unit: "Bank sampah unit lokal untuk melayani masyarakat sekitar.",
  waste_collector_unit: "Pegawai bank sampah unit yang mengumpulkan sampah dari customer.",
  waste_bank_central: "Bank sampah pusat yang mengelola beberapa bank sampah unit.",
  waste_collector_central: "Pegawai bank sampah induk yang mengumpulkan sampah dari BSU.",
  customer: "Kelola sampah rumah tangga Anda dan dapatkan hadiah.",
  industry: "Akses bahan daur ulang dan kelola keberlanjutan.",
  government: "Memantau dan menganalisis dampak lingkungan serta kebijakan."
};

export const validateForm = (formData: FormData) => {
  const errors: string[] = [];

  if (!formData.email || !formData.email.includes('@')) {
    errors.push('Email tidak valid');
  }

  if (formData.email && formData.email.length > 100) {
    errors.push('Email maksimal 100 karakter');
  }

  if (!formData.password || formData.password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }

  if (formData.password && formData.password.length > 100) {
    errors.push('Password maksimal 100 karakter');
  }

  if (formData.password !== formData.confirmPassword) {
    errors.push('Konfirmasi password tidak sesuai');
  }

  if (!formData.fullName || formData.fullName.trim().length < 2) {
    errors.push('Nama lengkap minimal 2 karakter');
  }

  if (formData.fullName && formData.fullName.trim().length > 100) {
    errors.push('Nama lengkap maksimal 100 karakter');
  }

  if (!formData.phone || formData.phone.length < 10) {
    errors.push('Nomor telepon minimal 10 digit');
  }

  if (formData.phone && formData.phone.length > 20) {
    errors.push('Nomor telepon maksimal 20 digit');
  }

  if (formData.role !== 'customer' && (!formData.institution || formData.institution.trim().length < 2)) {
    errors.push('Institusi wajib diisi');
  }

  if (formData.institution && formData.institution.trim().length > 100) {
    errors.push('Institusi maksimal 100 karakter');
  }

  if (!formData.address || formData.address.trim().length < 5) {
    errors.push('Alamat minimal 5 karakter');
  }

  if (formData.address && formData.address.trim().length > 200) {
    errors.push('Alamat maksimal 200 karakter');
  }

  if (!formData.city || formData.city.trim().length < 2) {
    errors.push('Kota tidak boleh kosong');
  }

  if (formData.city && formData.city.trim().length > 50) {
    errors.push('Kota maksimal 50 karakter');
  }

  if (!formData.province || formData.province.trim().length < 2) {
    errors.push('Provinsi tidak boleh kosong');
  }

  if (formData.province && formData.province.trim().length > 50) {
    errors.push('Provinsi maksimal 50 karakter');
  }

  if (!formData.coordinates) {
    errors.push('Lokasi GPS diperlukan');
  }

  return errors;
};

export const transformFormDataToApi = (formData: FormData) => {
  return {
    username: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    phone_number: formData.phone,
    institution: formData.institution || undefined,
    address: formData.address,
    city: formData.city,
    province: formData.province,
    location: {
      latitude: formData.coordinates?.latitude || 0,
      longitude: formData.coordinates?.longitude || 0
    }
  };
};

export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  province?: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung browser ini'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'WasteTrack-App'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            
            // Extract address components
            const roadName = address.road || address.street || '';
            const houseNumber = address.house_number || '';
            const village = address.village || address.suburb || address.neighbourhood || '';
            const district = address.district || address.subdistrict || '';
            
            // Build full address
            let fullAddress = '';
            if (houseNumber && roadName) {
              fullAddress = `${roadName} No. ${houseNumber}`;
            } else if (roadName) {
              fullAddress = roadName;
            }
            
            if (village && fullAddress) {
              fullAddress += `, ${village}`;
            } else if (village) {
              fullAddress = village;
            }
            
            if (district && fullAddress) {
              fullAddress += `, ${district}`;
            } else if (district) {
              fullAddress = district;
            }
            
            resolve({
              latitude,
              longitude,
              address: fullAddress || data.display_name?.split(',')[0] || '',
              city: address.city || address.town || address.municipality || address.county || '',
              province: address.state || address.province || ''
            });
          } else {
            // If reverse geocoding fails, just return coordinates
            resolve({
              latitude,
              longitude
            });
          }
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
          // If reverse geocoding fails, just return coordinates
          resolve({
            latitude,
            longitude
          });
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Akses lokasi ditolak'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Lokasi tidak tersedia'));
            break;
          case error.TIMEOUT:
            reject(new Error('Timeout mendapatkan lokasi'));
            break;
          default:
            reject(new Error('Error tidak diketahui'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

export const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'waste_bank_unit':
    case 'waste_bank_central':
      return '/waste-bank/dashboard';
    case 'waste_collector_unit':
    case 'waste_collector_central':
      return '/collector/dashboard';
    case 'customer':
      return '/customer/dashboard';
    case 'industry':
      return '/offtaker/dashboard';
    case 'government':
      return '/government/dashboard';
    default:
      return '/dashboard';
  }
}

// Simplified alert wrapper for register functions
export const safeAlert = {
  success: async (title: string, text?: string) => {
    try {
      return alerts.success(title, text);
    } catch (error) {
      console.error('Failed to show success alert:', error);
    }
  },
  
  error: async (title: string, text?: string) => {
    try {
      return alerts.error(title, text);
    } catch (error) {
      console.error('Failed to show error alert:', error);
      alert(`Error: ${title}`);
    }
  },
  
  validationError: async (message: string) => {
    try {
      return alerts.validationError(message);
    } catch (error) {
      console.error('Failed to show validation error:', error);
      alert(`Validation Error: ${message}`);
    }
  }
};