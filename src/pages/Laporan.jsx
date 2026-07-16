import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import "../styles/Laporan.css";

function Laporan() {
    const [daftarLaporan, setDaftarLaporan] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ambil data dari database tanpa filter waktu agar data lama/baru langsung muncul
    const fetchLaporan = useCallback(async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("laporan")
                .select("*")
                .order("id", { ascending: false });

            if (error) throw error;

            setDaftarLaporan(data || []);
        } catch (err) {
            console.error("Gagal memuat data laporan:", err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Mengelola pengambilan awal data & sinkronisasi real-time
    useEffect(() => {
        fetchLaporan();

        const kanalRealtime = supabase
            .channel("sinkronisasi_laporan_kelas")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "laporan" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const dataBaru = payload.new;

                        setDaftarLaporan((prev) => {
                            const sudahTerdaftar = prev.some(item => item.id === dataBaru.id);
                            if (sudahTerdaftar) return prev;
                            return [dataBaru, ...prev]; // Masuk langsung ke baris/kartu paling atas secara live
                        });
                    } else if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
                        fetchLaporan();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(kanalRealtime);
        };
    }, [fetchLaporan]);

    // Format Tanggal Premium ke gaya Indonesia (WIB)
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

            return `${namaHari}, ${tgl} - ${waktu} WIB`;
        } catch {
            return "Baru saja";
        }
    };

    // Penentu class CSS dinamis untuk Badge Status
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

    // Sub-render untuk mengisolasi Virtual DOM node agar tidak memicu 'removeChild' error
    const renderKontenDinamis = () => {
        if (loading) {
            return (
                <div key="state-loading" className="laporan-loading">
                    <div className="spinner-orange"></div>
                    <p>Menghubungkan ke server...</p>
                </div>
            );
        }

        if (daftarLaporan.length === 0) {
            return (
                <div key="state-empty" className="laporan-empty">
                    <p>Belum ada aktivitas laporan terdeteksi di database.</p>
                </div>
            );
        }

        return (
            <div key="state-cards-grid" className="laporan-grid-wrapper">
                {daftarLaporan.map((item, index) => (
                    <div key={`card-${item.id || index}`} className="laporan-card">
                        <div className="laporan-card-header">
                            <span className="laporan-card-no">#{daftarLaporan.length - index}</span>
                            <span className={`status-badge ${getBadgeClass(item.keterangan)}`}>
                                {item.keterangan || "Lainnya"}
                            </span>
                        </div>

                        <div className="laporan-card-body">
                            <h3 className="laporan-card-nama">{item.nama || "Tanpa Nama"}</h3>
                            <p className="laporan-card-kelas">IF D Siang 2024</p>

                            <div className="laporan-card-pesan-box">
                                <p className="laporan-card-pesan">
                                    {item.pesan ? `"${item.pesan}"` : "Tidak ada pesan keterangan tambahan."}
                                </p>
                            </div>
                        </div>

                        <div className="laporan-card-footer">
                            <span className="laporan-card-waktu">
                                {formatTanggal(item.created_at)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="laporan-page-root">
            <Header /><br /><br />
            <div className="laporan-container">
                <div className="laporan-wrapper">
                    <div className="laporan-header">
                        <span className="laporan-tag">Laporan IF D Siang</span>
                        <h1>Panel Laporan Absensi & Izin</h1>
                        <p className="sub-title">
                            Data rekapitulasi laporan absensi mahasiswa IF D Siang Angkatan 2024 yang tersimpan di dalam sistem.
                        </p>
                    </div>

                    {/* Wadah pembungkus mutlak untuk performa scroll dan isolasi DOM */}
                    <div className="laporan-dynamic-content-holder">
                        {renderKontenDinamis()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Laporan;