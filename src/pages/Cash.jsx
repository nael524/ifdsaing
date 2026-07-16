import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../styles/Cash.css";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function Cash() {
    const navigate = useNavigate();
    const [grandTotalKas, setGrandTotalKas] = useState(0);
    const [lastUpdated, setLastUpdated] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrandTotal();
    }, []);

    // Fungsi kompleks untuk mengubah ISO Timestamp dari database menjadi Format Hari, Tanggal & Waktu Indonesia secara lengkap
    const formatWaktuLengkap = (isoString) => {
        if (!isoString) return "-";

        try {
            const tanggal = new Date(isoString);

            // Validasi apakah string tanggal valid
            if (isNaN(tanggal.getTime())) return "-";

            // Mengambil Nama Hari (Contoh: Rabu)
            const namaHari = tanggal.toLocaleDateString("id-ID", { weekday: "long" });

            // Mengambil Tanggal, Bulan, Tahun (Contoh: 15 Juli 2026)
            const formatTanggal = tanggal.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            // Mengambil Jam, Menit, Detik (Contoh: 01:21:54)
            const formatWaktu = tanggal.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }).replace(/\./g, ":"); // Menghindari format titik bawaan lokal ID (misal 01.21.54 -> 01:21:54)

            return `${namaHari}, ${formatTanggal} pukul ${formatWaktu} WIB`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return "-";
        }
    };

    const fetchGrandTotal = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("total_kas_keseluruhan")
                .select("total_akumulasi, updated_at")
                .eq("id", 1)
                .single();

            if (error && error.code !== "PGRST116") throw error;

            if (data) {
                setGrandTotalKas(data.total_akumulasi);
                // Parsing langsung menggunakan helper fungsi kompleks
                setLastUpdated(formatWaktuLengkap(data.updated_at));
            } else {
                setGrandTotalKas(0);
                setLastUpdated("-");
            }
        } catch (err) {
            console.error("Gagal mengambil saldo global:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka);
    };

    return (
        <>
            <Header /><br /><br />
            <div className="cash-container">
                <div className="cash-wrapper">

                    {/* Bagian Header Konten */}
                    <div className="cash-title-row">
                        <h1 className="cash-main-title">Uang Cash</h1>
                        <button className="bendahara-btn" onClick={() => navigate("/login")}>
                            Bendahara
                        </button>
                    </div>

                    {/* Card 1: Total Uang Cash */}
                    <div className="cash-card total-card">
                        <p className="card-label label-center">Total Uang Cash</p>
                        <h2 className="cash-amount">
                            {loading ? "Memuat..." : formatRupiah(grandTotalKas)}
                        </h2>
                    </div>

                    {/* Card 2: Jumlah Mahasiswa */}
                    <div className="cash-card info-card">
                        <p className="card-label">Jumlah Mahasiswa/Mahasiswi IF D Siang</p>
                        <div className="card-content">
                            <div className="icon-wrapper blue-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    <path d="M9 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-1.9 0-5.7 1-5.7 3v2h11.4v-2c0-2-3.8-3-5.7-3z" opacity="0.5" />
                                    <path d="M15 12c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-1.9 0-5.7 1-5.7 3v2h11.4v-2c0-2-3.8-3-5.7-3z" opacity="0.5" />
                                </svg>
                            </div>
                            <span className="count-value">54</span>
                        </div>
                    </div>

                    {/* Card 3: Terakhir Diperbarui (Dinamis & Kompleks) */}
                    <div className="cash-card info-card">
                        <p className="card-label">Terakhir Diperbarui</p>
                        <div className="card-content">
                            <div className="icon-wrapper darkblue-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                            </div>
                            <span className="date-value" style={{ fontSize: "0.95rem" }}>
                                {loading ? "Memuat..." : lastUpdated}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Cash;