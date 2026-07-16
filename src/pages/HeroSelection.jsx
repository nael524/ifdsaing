import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import "../styles/Hero.css";
import mahasiswa from "../components/mahasiswa";

function HeroSelection() {
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);

  useEffect(() => {
    cekKoneksi();
  }, []);

  const cekKoneksi = async () => {
    const { error } = await supabase
      .from("laporan")
      .select("*")
      .limit(1);

    if (error) {
      console.log("❌ Gagal Terhubung");
      console.log(error);
    } else {
      console.log("✅ Berhasil Terhubung ke Supabase");
    }
  };

  const kirimPesan = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from("laporan")
      .insert([
        {
          nama,
          keterangan,
          pesan,
        },
      ]);

    if (error) {
      setLoading(false);
      setStatus("❌ Gagal mengirim laporan");
      setTimeout(() => setStatus(""), 2500);
      return;
    }

    // 1. Selesai upload: Matikan loading utama, hidupkan animasi transisi sukses
    setLoading(false);
    setShowSuccessLoader(true);

    // 2. Tahan efek sukses terkirim selama 1.8 detik untuk animasi loader melingkar -> centang
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // 3. Tampilkan kartu sukses penuh
    setShowSuccessLoader(false);
    setSuccess(true);

    // 4. Reset input form
    setNama("");
    setKeterangan("");
    setPesan("");
    setFile(null);
    setFileKey(Date.now());

    // 5. Tutup tampilan kartu sukses setelah 4 detik secara otomatis
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  return (
    <>
      <Header />

      <div className="hero-container">
        {/* Overlay Loader Sukses yang Estetik */}
        {showSuccessLoader && (
          <div className="success-loader-overlay">
            <div className="loader-box-card">
              <div className="svg-container">
                <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <p className="loader-text">Mengirim Laporan Berhasil...</p>
            </div>
          </div>
        )}

        <div className="hero-card">
          <h1>Pelaporan</h1>
          <p className="sub-title">
            Absensi dan Izin Kelas IF D Siang Angkatan 2024
          </p>

          <form onSubmit={kirimPesan}>
            <div className="input-group">
              <label>Nama</label>
              <select
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              >
                <option value="">Pilih Nama Anda</option>
                {mahasiswa.map((nama) => (
                  <option key={nama} value={nama}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Keterangan</label>
              <select
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                required
              >
                <option value="">Sakit / Izin / Lainnya</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Alpha">Alpha</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="input-group">
              <label>Bukti Sakit Atau Surat</label>
              <input
                key={fileKey}
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="input-group">
              <label>Pesan Laporan</label>
              <textarea
                rows="6"
                placeholder="Tuliskan keterangan Anda di sini..."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`send-btn ${loading ? "btn-loading" : ""}`}
              disabled={loading || showSuccessLoader}
            >
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  Sedang Mengirim...
                </>
              ) : (
                "Kirim Pesan"
              )}
            </button>
          </form>

          {status && (
            <div className="status-box error-status">
              <span>{status}</span>
            </div>
          )}

          {success && (
            <div className="success-card-toast">
              <div className="toast-icon">✓</div>
              <div className="toast-body">
                <h3>Laporan Terkirim!</h3>
                <p>Pesan anda Sudah Terkirim.</p>
              </div>
              <button className="toast-close" onClick={() => setSuccess(false)}>×</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HeroSelection;