import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import "../styles/Laporan.css";

function Laporan() {
    const [daftarLaporan, setDaftarLaporan] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLaporan();
    }, []);

    const fetchLaporan = async () => {
        try {
            setLoading(true);

            // 1. Hitung waktu untuk 24 jam yang lalu dalam format ISO String
            const batas24JamLalu = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // 2. Ambil data dengan filter gte (Greater Than or Equal) pada kolom 'created_at'
            const { data, error } = await supabase
                .from("laporan")
                .select("*")
                .gte("created_at", batas24JamLalu) // Hanya ambil data 24 jam terakhir
                .order("id", { ascending: false });

            if (error) throw error;
            setDaftarLaporan(data || []);
        } catch (err) {
            console.error("Gagal mengambil data laporan:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatTanggal = (isoString) => {
        if (!isoString) return "Baru saja";
        try {
            const tanggal = new Date(isoString);
            if (isNaN(tanggal.getTime())) return "Baru saja";

            const namaHari = tanggal.toLocaleDateString("id-ID", { weekday: "long" });
            const tgl = tanggal.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            const waktu = tanggal.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
            }).replace(/\./g, ":");

            return `${namaHari}, ${tgl} pukul ${waktu} WIB`;
        } catch {
            return "Baru saja";
        }
    };

    const getBadgeClass = (keterangan) => {
        switch (keterangan?.toLowerCase()) {
            case "sakit":
                return "badge-sakit";
            case "izin":
                return "badge-izin";
            case "alpha":
                return "badge-alpha";
            default:
                return "badge-lainnya";
        }
    };

    return (
        <>
            <Header />
            <div className="laporan-container">
                <div className="laporan-wrapper">
                    <div className="laporan-header">
                        <span className="laporan-tag">Daftar Aktivitas</span>
                        <h1>Laporan Absensi & Izin</h1>
                        <p className="sub-title">
                            Data laporan sakit, izin, dan absensi mahasiswa IF D Siang Angkatan 2024 (24 Jam Terakhir)
                        </p>
                    </div>

                    {loading ? (
                        <div className="laporan-loading">
                            <div className="spinner-orange"></div>
                            <p>Memuat data laporan...</p>
                        </div>
                    ) : daftarLaporan.length === 0 ? (
                        <div className="laporan-empty">
                            <p>Belum ada laporan dalam 24 jam terakhir.</p>
                        </div>
                    ) : (
                        <div className="laporan-grid">
                            {daftarLaporan.map((item) => (
                                <div className="laporan-card" key={item.id}>
                                    <div className="card-header-row">
                                        <div className="user-profile-info">
                                            <h3>{item.nama}</h3>
                                            <span className="user-subtext">IF D Siang 2024</span>
                                        </div>
                                        <span className={`status-badge ${getBadgeClass(item.keterangan)}`}>
                                            {item.keterangan}
                                        </span>
                                    </div>

                                    <div className="card-body-content">
                                        <p className="pesan-text">{item.pesan}</p>
                                    </div>

                                    <div className="card-footer-info">
                                        <div className="footer-time-wrapper">
                                            <svg className="clock-icon" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                            </svg>
                                            <span className="date-text">
                                                {formatTanggal(item.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Laporan;