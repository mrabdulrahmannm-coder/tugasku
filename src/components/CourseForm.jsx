import { useState } from 'react';
import { X, BookOpen, MapPin, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function CourseForm({ isOpen, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);

  const initial = {
    kode_matkul: '',
    nama_matkul: '',
    sks: '',
    kategori: '',
    dosen_pengampu: '',
    ruangan: '',
  };
  const [values, setValues] = useState(initial);

  const resetForm = () => setValues(initial);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.kode_matkul.trim() || !values.nama_matkul.trim()) {
      alert('Kode dan Nama Mata Kuliah wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/mata-kuliah', {
        kode_matkul: values.kode_matkul.trim(),
        nama_matkul: values.nama_matkul.trim(),
        sks: values.sks ? parseInt(values.sks, 10) : null,
        kategori: values.kategori || null,
        dosen_pengampu: values.dosen_pengampu.trim() || null,
        ruangan: values.ruangan.trim() || null,
      });

      if (onCreated) {
        onCreated(res.data?.data || res.data);
      }
      resetForm();
      if (onClose) onClose();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.kode_matkul?.[0] ||
        error.response?.data?.errors?.nama_matkul?.[0] ||
        'Gagal menyimpan mata kuliah.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1C2A20] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-emerald-900/30 flex items-center justify-between bg-white dark:bg-[#1C2A20] shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E2F0E3] dark:bg-emerald-950/80 text-[#224A2A] dark:text-emerald-300 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-emerald-100 text-lg leading-snug">
                Tambah Mata Kuliah
              </h3>
              <p className="text-xs text-gray-500 dark:text-emerald-300/60">
                Tambah mata kuliah baru ke daftar perkuliahan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-emerald-300/50 hover:text-gray-600 dark:hover:text-emerald-100 hover:bg-gray-100 dark:hover:bg-emerald-900/40 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Form Elements */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-medium text-gray-700 dark:text-emerald-100">
            
            {/* 1. Kode Mata Kuliah */}
            <div>
              <label className="block font-bold text-gray-800 dark:text-emerald-200 mb-1.5">
                Kode Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={values.kode_matkul}
                onChange={(e) => handleChange('kode_matkul', e.target.value)}
                placeholder="Contoh: IF-401"
                className="w-full px-4 py-2.5 bg-[#EEF5EF] dark:bg-[#152219] border border-transparent dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl outline-none focus:ring-2 focus:ring-[#3D5245]/20 font-semibold text-gray-800 dark:text-emerald-100 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
              />
            </div>

            {/* 2. Nama Mata Kuliah */}
            <div>
              <label className="block font-bold text-gray-800 dark:text-emerald-200 mb-1.5">
                Nama Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={values.nama_matkul}
                onChange={(e) => handleChange('nama_matkul', e.target.value)}
                placeholder="Contoh: Pemrograman Web"
                className="w-full px-4 py-2.5 bg-[#EEF5EF] dark:bg-[#152219] border border-transparent dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl outline-none focus:ring-2 focus:ring-[#3D5245]/20 font-semibold text-gray-800 dark:text-emerald-100 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
              />
            </div>

            {/* 3. SKS */}
            <div>
              <label className="block font-bold text-gray-800 dark:text-emerald-200 mb-1.5">SKS</label>
              <input
                type="number"
                min="1"
                max="6"
                value={values.sks}
                onChange={(e) => handleChange('sks', e.target.value)}
                placeholder="3"
                className="w-full px-4 py-2.5 bg-[#EEF5EF] dark:bg-[#152219] border border-transparent dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl outline-none focus:ring-2 focus:ring-[#3D5245]/20 font-semibold text-gray-800 dark:text-emerald-100 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
              />
            </div>

            {/* 4. Kategori */}
            <div>
              <label className="block font-bold text-gray-800 dark:text-emerald-200 mb-1.5">Kategori</label>
              <select
                value={values.kategori}
                onChange={(e) => handleChange('kategori', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#EEF5EF] dark:bg-[#152219] border border-transparent dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl outline-none focus:ring-2 focus:ring-[#3D5245]/20 font-semibold text-gray-800 dark:text-emerald-100 transition-all cursor-pointer"
              >
                <option value="" className="dark:bg-[#1C2A20] dark:text-emerald-100">Pilih kategori</option>
                <option value="Teori" className="dark:bg-[#1C2A20] dark:text-emerald-100">Teori</option>
                <option value="Praktikum" className="dark:bg-[#1C2A20] dark:text-emerald-100">Praktikum</option>
                <option value="Praktikum & Teori" className="dark:bg-[#1C2A20] dark:text-emerald-100">Praktikum & Teori</option>
                <option value="Studio Desain" className="dark:bg-[#1C2A20] dark:text-emerald-100">Studio Desain</option>
                <option value="Riset & Teori" className="dark:bg-[#1C2A20] dark:text-emerald-100">Riset & Teori</option>
                <option value="Praktikum Cisco" className="dark:bg-[#1C2A20] dark:text-emerald-100">Praktikum Cisco</option>
              </select>
            </div>

            {/* 5. Dosen Pengampu */}
            <div>
              <label className="block font-bold text-gray-800 dark:text-emerald-200 mb-1.5">Dosen Pengampu</label>
              <input
                type="text"
                value={values.dosen_pengampu}
                onChange={(e) => handleChange('dosen_pengampu', e.target.value)}
                placeholder="Nama dosen pengampu"
                className="w-full px-4 py-2.5 bg-[#EEF5EF] dark:bg-[#152219] border border-transparent dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl outline-none focus:ring-2 focus:ring-[#3D5245]/20 font-semibold text-gray-800 dark:text-emerald-100 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
              />
            </div>

            {/* 6. Ruangan */}
            <div>
              <label className="block font-bold text-gray-800 dark:text-emerald-200 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-[#3D5245] dark:text-emerald-400" /> Ruangan
              </label>
              <input
                type="text"
                value={values.ruangan}
                onChange={(e) => handleChange('ruangan', e.target.value)}
                placeholder="Contoh: Lab Komputer 1"
                className="w-full px-4 py-2.5 bg-[#EEF5EF] dark:bg-[#152219] border border-transparent dark:border-emerald-800/40 focus:border-[#3D5245] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#18281D] rounded-xl outline-none focus:ring-2 focus:ring-[#3D5245]/20 font-semibold text-gray-800 dark:text-emerald-100 transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-300/40"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-emerald-900/30 flex items-center justify-end gap-3 bg-white dark:bg-[#1C2A20] shrink-0 transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-emerald-200 hover:bg-gray-100 dark:hover:bg-emerald-900/40 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold bg-[#3D5245] hover:bg-[#2F4036] dark:bg-emerald-800 dark:hover:bg-emerald-700 active:scale-95 text-white rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-emerald-200" />
                  <span>Simpan Mata Kuliah</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}