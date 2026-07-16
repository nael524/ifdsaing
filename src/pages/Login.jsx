import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate untuk redirect halaman
import "../styles/Login.css";
import Header from "../components/Header";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate(); // Hook untuk navigasi antar halaman

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        // Simulasi proses autentikasi (ganti kredensial ini sesuai keinginanmu)
        setTimeout(() => {
            if (username.trim() === "bendahara" && password === "025031") {
                setLoading(false);
                // Navigasi langsung ke halaman bendahara jika data cocok
                navigate("/bendahara");
            } else {
                setLoading(false);
                setErrorMessage("❌ Username atau Kata Sandi salah!");
            }
        }, 1800); // Waktu jeda transisi loading simulasi selama 1.8 detik
    };

    return (
        <>
            <Header /><br /> <br />
            <div className="login-container">
                <div className="login-visual-side">
                    <div className="visual-overlay"></div>
                    <div className="visual-content">
                        <span className="badge-tag">Portal Bendahara</span>
                        <h2>Sistem Transparansi Kas IF D Siang</h2>
                        <p>Kelola, pantau, dan laporkan keuangan kelas secara akurat, aman, dan mudah dalam satu platform terintegrasi.</p>
                    </div>
                </div>

                {/* Kolom Kanan: Form Login */}
                <div className="login-form-side">
                    <div className="form-container-box">
                        <div className="form-header">
                            <h1>Selamat Datang</h1>
                            <p>Silakan masuk menggunakan kredensial Bendahara Anda</p>
                        </div>

                        {/* Alert Pesan Error jika Login Gagal */}
                        {errorMessage && (
                            <div className="login-error-alert">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="modern-form">

                            {/* Input Username dengan Floating Label */}
                            <div className="form-group-floating">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder=" "
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                                <label htmlFor="username">Username</label>
                                <span className="input-line"></span>
                            </div>

                            {/* Input Password dengan Floating Label & Toggle Show/Hide */}
                            <div className="form-group-floating password-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="password">Kata Sandi</label>
                                <span className="input-line"></span>
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                                </button>
                            </div>

                            {/* Opsi Tambahan Form */}
                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    <span className="custom-checkbox"></span>
                                    Ingat saya
                                </label>
                                <a href="#forgot" className="forgot-password-link">Lupa Password?</a>
                            </div>

                            {/* Tombol Submit dengan Loader */}
                            <button
                                type="submit"
                                className={`login-submit-btn ${loading ? "btn-loading" : ""}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-mini"></span>
                                        Memverifikasi...
                                    </>
                                ) : (
                                    "Masuk Sekarang"
                                )}
                            </button>

                        </form>

                        <div className="form-footer">
                            <p>Bukan Bendahara? <a href="/">Kembali ke Beranda</a></p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Login;