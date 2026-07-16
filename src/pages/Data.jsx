import "../styles/Data.css";
import Header from "../components/Header";
import mahasiswa from "../components/mahasiswa";

function Data() {
    // List mahasiswa yang sudah tidak aktif
    const nonAktifList = ["Fransisco Purba", "adinda aulia"];

    const cekStatusMhs = (namaMhs) => {
        if (!namaMhs) return { teks: "Aktif", kelas: "active" };

        // Membandingkan dengan huruf kecil agar tidak sensitif huruf kapital
        const isNonAktif = nonAktifList.some(
            (nama) => namaMhs.toLowerCase().trim() === nama.toLowerCase().trim()
        );

        return isNonAktif
            ? { teks: "Tidak Aktif", kelas: "non-active" }
            : { teks: "Aktif", kelas: "active" };
    };

    return (
        <>
            <Header /><br /><br /><br />
            <div className="data-container">
                <div className="data-wrapper">

                    {/* Header Bagian Atas */}
                    <div className="data-header-section">
                        <h1 className="data-title">Daftar Mahasiswa</h1>
                        <p className="data-subtitle">
                            Kelas IF D Siang • Angkatan 2024 ({mahasiswa.length} Mahasiswa)
                        </p>
                    </div>

                    {/* Wrapper Tabel & Card Konten Responsif dengan Scrollbar */}
                    <div className="table-responsive-container" style={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th className="col-num">No.</th>
                                    <th className="col-name">Nama Lengkap</th>
                                    <th className="col-class">Kelas</th>
                                    <th className="col-status">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mahasiswa.map((nama, index) => {
                                    const status = cekStatusMhs(nama);
                                    return (
                                        <tr key={index}>
                                            <td className="col-num-data" data-label="No.">
                                                {index + 1}
                                            </td>
                                            <td className="col-name-data" data-label="Nama">
                                                <strong>{nama}</strong>
                                            </td>
                                            <td className="col-class-data" data-label="Kelas">
                                                IF D Siang
                                            </td>
                                            <td className="col-status-data" data-label="Status">
                                                <span className={`status-badge ${status.kelas}`}>
                                                    ● {status.teks}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Data;