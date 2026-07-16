import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import mahasiswaList from "../components/mahasiswa";
import "../styles/Bendahara.css";

function Bendahara() {
    const [searchQuery, setSearchQuery] = useState("");
    const [dataKas, setDataKas] = useState({});
    const [totalKasBulanIni, setTotalKasBulanIni] = useState(0);
    const [grandTotalKas, setGrandTotalKas] = useState(0);
    const [lastUpdated, setLastUpdated] = useState(""); // State baru untuk menampilkan waktu update di Dashboard Bendahara
    const [loading, setLoading] = useState(true);

    // State baru untuk mendeteksi proses penyimpanan (mencegah klik ganda)
    const [isSaving, setIsSaving] = useState(false);
    const [savingStatus, setSavingStatus] = useState("");

    // --- State Bulan dan Tahun ---
    const [selectedMonth, setSelectedMonth] = useState("Januari");
    const [selectedYear, setSelectedYear] = useState("2026");

    const NOMINAL_MINGGUAN = 5000;

    const daftarBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const daftarTahun = ["2026", "2027", "2028"];

    useEffect(() => {
        fetchDataKas();
        fetchGrandTotal();
    }, [selectedMonth, selectedYear]);

    // Helper untuk memformat ISO string menjadi format tanggal & jam Indonesia yang cantik
    const formatWaktuIndonesia = (isoString) => {
        if (!isoString) return "-";
        const tanggal = new Date(isoString);

        const formatTanggal = tanggal.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "Long",
            year: "numeric"
        });
        const formatWaktu = tanggal.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit" // Ditambahkan detik agar terlihat lebih presisi & kompleks
        });

        return `${formatTanggal} ${formatWaktu} WIB`;
    };

    // 1. Ambil data checklist bulanan dari Supabase
    const fetchDataKas = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("kas_mahasiswa")
                .select("*")
                .eq("bulan", selectedMonth)
                .eq("tahun", selectedYear);

            if (error) throw error;

            const mappingData = {};
            let kalkulasiBulanIni = 0;

            mahasiswaList.forEach((mhs) => {
                mappingData[mhs] = {
                    w1: false, w2: false, w3: false, w4: false,
                    w1_date: "", w2_date: "", w3_date: "", w4_date: ""
                };
            });

            data.forEach((item) => {
                mappingData[item.nama] = {
                    w1: item.w1 || false,
                    w2: item.w2 || false,
                    w3: item.w3 || false,
                    w4: item.w4 || false,
                    w1_date: item.w1_date || "",
                    w2_date: item.w2_date || "",
                    w3_date: item.w3_date || "",
                    w4_date: item.w4_date || "",
                };

                if (item.w1) kalkulasiBulanIni += NOMINAL_MINGGUAN;
                if (item.w2) kalkulasiBulanIni += NOMINAL_MINGGUAN;
                if (item.w3) kalkulasiBulanIni += NOMINAL_MINGGUAN;
                if (item.w4) kalkulasiBulanIni += NOMINAL_MINGGUAN;
            });

            setDataKas(mappingData);
            setTotalKasBulanIni(kalkulasiBulanIni);
        } catch (err) {
            console.error("Gagal mengambil data kas:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Ambil total saldo global beserta waktu update terakhir dari database
    const fetchGrandTotal = async () => {
        try {
            const { data, error } = await supabase
                .from("total_kas_keseluruhan")
                .select("total_akumulasi, updated_at")
                .eq("id", 1)
                .single();

            if (error && error.code !== "PGRST116") throw error;

            if (data) {
                setGrandTotalKas(data.total_akumulasi);
                setLastUpdated(formatWaktuIndonesia(data.updated_at));
            } else {
                setGrandTotalKas(0);
                setLastUpdated("-");
            }
        } catch (err) {
            console.error("Gagal mengambil saldo global:", err.message);
        }
    };

    // 3. Handle interaksi checkbox (State Lokal Sementara)
    const handleCheckboxChange = (nama, minggu) => {
        if (isSaving) return;

        const keyMinggu = minggu;
        const keyTanggal = `${minggu}_date`;

        const currentStatus = dataKas[nama]?.[keyMinggu] || false;
        const newStatus = !currentStatus;

        // Memformat waktu lokal secara kompleks (Hari, Jam:Menit) saat checklist dicentang
        const optionsTanggal = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const optionsWaktu = { hour: '2-digit', minute: '2-digit' };

        const formatTanggal = newStatus
            ? `${new Date().toLocaleDateString('id-ID', optionsTanggal)} ${new Date().toLocaleTimeString('id-ID', optionsWaktu)}`
            : "";

        const updatedUserKas = {
            ...(dataKas[nama] || {
                w1: false, w2: false, w3: false, w4: false,
                w1_date: "", w2_date: "", w3_date: "", w4_date: ""
            }),
            [keyMinggu]: newStatus,
            [keyTanggal]: formatTanggal
        };

        const updatedDataKas = {
            ...dataKas,
            [nama]: updatedUserKas
        };

        setDataKas(updatedDataKas);

        let hitungUlang = 0;
        Object.values(updatedDataKas).forEach((item) => {
            if (item.w1) hitungUlang += NOMINAL_MINGGUAN;
            if (item.w2) hitungUlang += NOMINAL_MINGGUAN;
            if (item.w3) hitungUlang += NOMINAL_MINGGUAN;
            if (item.w4) hitungUlang += NOMINAL_MINGGUAN;
        });
        setTotalKasBulanIni(hitungUlang);
    };

    // 4. FUNGSI UTAMA: Menyimpan & Sinkronisasi dengan dynamic loader agar bebas error
    const handleSaveDatabase = async () => {
        if (isSaving) return;

        setIsSaving(true);
        setSavingStatus(`⏳ Menyimpan lembar kas bulan ${selectedMonth} ${selectedYear}...`);

        try {
            const dataToUpsert = Object.keys(dataKas).map((nama) => ({
                nama: nama,
                bulan: selectedMonth,
                tahun: selectedYear,
                w1: dataKas[nama].w1,
                w2: dataKas[nama].w2,
                w3: dataKas[nama].w3,
                w4: dataKas[nama].w4,
                w1_date: dataKas[nama].w1_date,
                w2_date: dataKas[nama].w2_date,
                w3_date: dataKas[nama].w3_date,
                w4_date: dataKas[nama].w4_date,
            }));

            // A. Simpan lembar checklist bulan aktif
            const { error: upsertError } = await supabase
                .from("kas_mahasiswa")
                .upsert(dataToUpsert, { onConflict: 'nama,bulan,tahun' });

            if (upsertError) throw upsertError;

            // B. Ambil kembali data global untuk menjamin sinkronisasi total uang kas global akurat
            const { data: allKas, error: fetchAllError } = await supabase
                .from("kas_mahasiswa")
                .select("w1, w2, w3, w4");

            if (fetchAllError) throw fetchAllError;

            let kalkulasiGrandTotal = 0;
            allKas.forEach((item) => {
                if (item.w1) kalkulasiGrandTotal += NOMINAL_MINGGUAN;
                if (item.w2) kalkulasiGrandTotal += NOMINAL_MINGGUAN;
                if (item.w3) kalkulasiGrandTotal += NOMINAL_MINGGUAN;
                if (item.w4) kalkulasiGrandTotal += NOMINAL_MINGGUAN;
            });

            // Menyimpan waktu terkini dalam bentuk format standar ISO yang presisi
            const waktuSekarangISO = new Date().toISOString();

            // C. Update total uang kas keseluruhan di tabel global beserta waktu terbaru
            const { error: totalError } = await supabase
                .from("total_kas_keseluruhan")
                .upsert({
                    id: 1,
                    total_akumulasi: kalkulasiGrandTotal,
                    updated_at: waktuSekarangISO
                });

            if (totalError) throw totalError;

            // D. Set state global & berikan pesan sukses yang dinamis
            setGrandTotalKas(kalkulasiGrandTotal);
            setLastUpdated(formatWaktuIndonesia(waktuSekarangISO));
            setSavingStatus(`✅ Lembar kas bulan ${selectedMonth} ${selectedYear} sudah disimpan! Total global berhasil ditambahkan.`);

            // Hilangkan status setelah 4 detik
            setTimeout(() => setSavingStatus(""), 4000);
        } catch (err) {
            console.error("Gagal sinkronisasi data:", err.message);
            setSavingStatus(`❌ Gagal menyimpan data: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredMahasiswa = mahasiswaList.filter((mhs) =>
        mhs.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bendahara-container">
            {/* Top Banner Status Keuangan */}
            <div className="bendahara-hero-card">
                <div className="hero-info">
                    <span className="hero-tag">Dashboard Bendahara</span>
                    <h1>Manajemen Kas Kelas</h1>
                    <p>IF D Siang Angkatan 2024</p>
                    <small style={{ color: "#ffffffa3", display: "block", marginTop: "8px" }}>
                        Terakhir Diperbarui: <strong>{lastUpdated}</strong>
                    </small>
                </div>
                <div className="stats-container-row">
                    <div className="hero-balance-box sub-box">
                        <span className="balance-label">Kas ({selectedMonth} {selectedYear})</span>
                        <h3 className="balance-amount-small">
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            }).format(totalKasBulanIni)}
                        </h3>
                    </div>
                    <div className="hero-balance-box main-box">
                        <span className="balance-label">Total Uang Cash (Global)</span>
                        <h2 className="balance-amount">
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            }).format(grandTotalKas)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Banner Notifikasi Proses (Loader / Sukses) */}
            {savingStatus && (
                <div className={`saving-notification-banner ${isSaving ? 'loading-state' : 'success-state'}`}>
                    <span className="notification-text">{savingStatus}</span>
                </div>
            )}

            {/* Kontrol Utama, Pencarian, Filter Periode & Tombol Simpan */}
            <div className="control-bar">
                <div className="search-box-wrapper">
                    <input
                        type="text"
                        placeholder="Cari nama mahasiswa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        disabled={isSaving}
                    />
                </div>

                <div className="period-filter-wrapper">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="select-custom"
                        disabled={isSaving}
                    >
                        {daftarBulan.map((bln) => (
                            <option key={bln} value={bln}>{bln}</option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="select-custom"
                        disabled={isSaving}
                    >
                        {daftarTahun.map((thn) => (
                            <option key={thn} value={thn}>{thn}</option>
                        ))}
                    </select>
                </div>

                {/* Tombol Simpan Database dengan Loading State */}
                <button
                    className={`btn-save-db ${isSaving ? "button-disabled" : ""}`}
                    onClick={handleSaveDatabase}
                    disabled={isSaving}
                >
                    {isSaving ? "Memproses..." : "Simpan Lembar Kas"}
                </button>

                <div className="legend-info">
                    <span><strong>Tarif:</strong> Rp 5.000 / Minggu</span>
                </div>
            </div>

            {/* Tabel Data Kas Mahasiswa */}
            {loading ? (
                <div className="bendahara-loading">
                    <span className="spinner"></span>
                    <p>Memuat lembar kas {selectedMonth} {selectedYear}...</p>
                </div>
            ) : (
                /* Pembungkus Tambahan Untuk Efek Horizontal Scroll di Handphone */
                <div className="table-responsive-container">
                    <div className="table-wrapper">
                        <table className="kas-table">
                            <thead>
                                <tr>
                                    <th className="th-num">No.</th>
                                    <th className="th-name">Nama Mahasiswa</th>
                                    <th className="th-week">Minggu 1</th>
                                    <th className="th-week">Minggu 2</th>
                                    <th className="th-week">Minggu 3</th>
                                    <th className="th-week">Minggu 4</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMahasiswa.map((nama, idx) => {
                                    const kas = dataKas[nama] || {
                                        w1: false, w2: false, w3: false, w4: false,
                                        w1_date: "", w2_date: "", w3_date: "", w4_date: ""
                                    };

                                    return (
                                        <tr key={nama}>
                                            <td className="td-num-val">{idx + 1}</td>
                                            <td className="td-name-val">
                                                <strong>{nama}</strong>
                                                <span className="sub-tag">IF D Siang</span>
                                            </td>

                                            {["w1", "w2", "w3", "w4"].map((minggu) => (
                                                <td key={minggu} className="td-checkbox-cell">
                                                    <label className="checkbox-container">
                                                        <input
                                                            type="checkbox"
                                                            checked={kas[minggu]}
                                                            onChange={() => handleCheckboxChange(nama, minggu)}
                                                            disabled={isSaving}
                                                        />
                                                        <span className="checkmark-box"></span>
                                                    </label>
                                                    {kas[`${minggu}_date`] && (
                                                        <span className="date-stamp">{kas[`${minggu}_date`]}</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Bendahara;