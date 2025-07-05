import { Alert } from "@/components/ui";

export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  fullName: string;
  phone: string; // Formatted phone (with dashes)
  phoneClean: string; // Clean phone number for DB
  institution: string;
  address: string;
  city: string;
  province: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

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

  // Validate phone number (clean version)
  const cleanPhone = formData.phoneClean || formData.phone.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    errors.push('Nomor telepon minimal 10 digit');
  }

  if (cleanPhone && cleanPhone.length > 13) {
    errors.push('Nomor telepon maksimal 13 digit');
  }

  // Validate Indonesian phone format
  if (cleanPhone && !/^08[1-9][0-9]{7,10}$/.test(cleanPhone)) {
    errors.push('Format nomor telepon tidak valid (harus dimulai dengan 08)');
  }

  if (
    formData.role !== 'customer' &&
    (!formData.institution || formData.institution.trim().length < 2)
  ) {
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
  // Ensure we always have clean phone number
  const cleanPhoneNumber = formData.phoneClean || formData.phone.replace(/\D/g, '');
  
  return {
    username: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    phone_number: cleanPhoneNumber, // Always send clean number to API
    institution: formData.institution || undefined,
    address: formData.address,
    city: formData.city,
    province: formData.province,
    location: {
      latitude: formData.coordinates?.latitude || 0,
      longitude: formData.coordinates?.longitude || 0,
    },
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
                'User-Agent': 'WasteTrack-App',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address;

            // Extract address components
            const roadName = address.road || address.street || '';
            const houseNumber = address.house_number || '';
            const village =
              address.village || address.suburb || address.neighbourhood || '';
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
              city:
                address.city ||
                address.town ||
                address.municipality ||
                address.county ||
                '',
              province: address.state || address.province || '',
            });
          } else {
            // If reverse geocoding fails, just return coordinates
            resolve({
              latitude,
              longitude,
            });
          }
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
          // If reverse geocoding fails, just return coordinates
          resolve({
            latitude,
            longitude,
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
        maximumAge: 0,
      }
    );
  });
};

// Function to get the redirect path after registration
// This function is used to determine where to redirect the user after successful registration
export const getRedirectPath = (): string => {
  // Always redirect to verify email page after registration
  return '/login';
};

// Simplified alert wrapper for register functions
export const safeAlert = {
  success: async (title: string, text?: string) => {
    try {
      return Alert.success({
        title,
        text
      });
    } catch (error) {
      console.error('Failed to show success alert:', error);
    }
  },

  error: async (title: string, text?: string) => {
    try {
      return Alert.error({
        title,
        text
      });
    } catch (error) {
      console.error('Failed to show error alert:', error);
      alert(`Error: ${title}`);
    }
  },

  validationError: async (message: string) => {
    try {
      return Alert.warning({
        title: 'Data Tidak Valid',
        text: message
      });
    } catch (error) {
      console.error('Failed to show validation error:', error);
      alert(`Validation Error: ${message}`);
    }
  },
};

export const handleRegisterError = async (
  error: Error | { message: string } | string | unknown
) => {
  // Specific error handling for registration
  const errorMessage =
    typeof error === 'string'
      ? error
      : (error as Error)?.message || 'Terjadi kesalahan saat registrasi';

  if (errorMessage.includes('Email sudah terdaftar')) {
    await safeAlert.error('Registrasi Gagal', errorMessage);
    return;
  }

  if (errorMessage.includes('Data registrasi tidak valid')) {
    await safeAlert.error('Data Tidak Valid', errorMessage);
    return;
  }

  await safeAlert.error('Registrasi Gagal', errorMessage);
};
