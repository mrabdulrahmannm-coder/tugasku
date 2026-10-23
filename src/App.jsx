import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SsoCallback from './pages/SsoCallback';
import Beranda from './pages/Beranda';
import DaftarTugas from './pages/DaftarTugas';
import Kalendar from './pages/Kalendar';
import MataKuliah from './pages/MataKuliah';
import Pengaturan from './pages/Pengaturan';
import UmpanBalik from './pages/UmpanBalik';
import AdminFeedback from './pages/AdminFeedback';

// Peta nama halaman (dipakai oleh onNavigate di seluruh aplikasi) <-> path URL.
const PAGE_PATHS = {
  Login: '/',
  Register: '/register',
  'Forgot Password': '/forgot-password',
  'Reset Password': '/reset-password',
  'SSO Callback': '/sso/callback',
  Beranda: '/beranda',
  'Daftar Tugas': '/daftar-tugas',
  Kalender: '/kalender',
  'Mata Kuliah': '/mata-kuliah',
  Pengaturan: '/pengaturan',
  'Umpan Balik': '/umpan-balik',
  'Feedback Admin': '/admin/feedback',
};

const PATH_TO_PAGE = Object.entries(PAGE_PATHS).reduce((acc, [page, path]) => {
  acc[path] = page;
  return acc;
}, {});

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Halaman aktif diturunkan langsung dari path URL (tidak memakai state),
  // sehingga tautan dari email (deep link), tombol back/forward, dan
  // onNavigate selalu konsisten dengan alamat di address bar.
  const currentPage = PATH_TO_PAGE[location.pathname] || 'Login';

  // onNavigate tetap menerima nama halaman, lalu memperbarui URL.
  const handleNavigate = useCallback(
    (page) => {
      navigate(PAGE_PATHS[page] || '/');
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-[#F0F4F1] dark:bg-[#121E16] font-sans antialiased text-gray-800 dark:text-emerald-100 transition-colors duration-200">
      {/* 1. Halaman Login */}
      {currentPage === 'Login' && (
        <Login
          onNavigate={handleNavigate}
          onLogin={(targetPage = 'Beranda') => handleNavigate(targetPage)}
        />
      )}

      {/* 2. Halaman Register */}
      {currentPage === 'Register' && (
        <Register
          onNavigate={handleNavigate}
          onLogin={(targetPage = 'Beranda') => handleNavigate(targetPage)}
        />
      )}

      {/* 3. Halaman Lupa Password */}
      {currentPage === 'Forgot Password' && <ForgotPassword onNavigate={handleNavigate} />}

      {/* 4. Halaman Atur Ulang Password */}
      {currentPage === 'Reset Password' && <ResetPassword onNavigate={handleNavigate} />}

      {/* 5. Halaman Callback SSO Polibatam */}
      {currentPage === 'SSO Callback' && (
        <SsoCallback onLogin={(targetPage = 'Beranda') => handleNavigate(targetPage)} />
      )}

      {/* 6. Halaman Beranda */}
      {currentPage === 'Beranda' && (
        <Beranda
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}

      {/* 7. Halaman Daftar Tugas */}
      {currentPage === 'Daftar Tugas' && (
        <DaftarTugas
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}

      {/* 8. Halaman Kalender */}
      {currentPage === 'Kalender' && (
        <Kalendar
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}

      {/* 9. Halaman Mata Kuliah */}
      {currentPage === 'Mata Kuliah' && (
        <MataKuliah
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}

      {/* 10. Halaman Pengaturan */}
      {currentPage === 'Pengaturan' && (
        <Pengaturan
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}

      {/* 11. Halaman Umpan Balik */}
      {currentPage === 'Umpan Balik' && (
        <UmpanBalik
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}
      {currentPage === 'Feedback Admin' && (
        <AdminFeedback
          onNavigate={handleNavigate}
          onLogout={() => handleNavigate('Login')}
        />
      )}
    </div>
  );
}