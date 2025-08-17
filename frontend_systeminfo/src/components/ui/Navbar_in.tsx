'use client';
import { useState } from "react";
import { FaUserCircle, FaBars } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import styles from "../../styles/dashboard.module.css";

const Navbar = ({ user, onTabChange }) => {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleTabClick = (tab) => {
        onTabChange(tab);
        setMenuOpen(false); // Cerrar el menú después de seleccionar una pestaña
    };

    return (
        <nav className={styles.navbar}>
            <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
                <FaBars />
            </button>
            <div className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
                <a href="#" onClick={() => handleTabClick("dashboard")}>Dashboard</a>
                <a href="#" onClick={() => handleTabClick("cpu-detail")}>CPU</a>
                <a href="#" onClick={() => handleTabClick("memory-detail")}>Memoria</a>
                <a href="#" onClick={() => handleTabClick("network-detail")}>Red</a>
                <a href="#" onClick={() => handleTabClick("process-detail")}>Procesos</a>
                <a href="#" onClick={() => handleTabClick("report")}>Generar Reporte</a>
                <span className={`material-symbols-rounded ${styles.closeBtn} `} onClick={() => setMenuOpen(false)}>close</span>
            </div>
            <div className={styles.userMenu}>
                <FaUserCircle className={styles.userIcon} />
                <div className={styles.userMenuContent}>
                    {user && <a href="#">{user.email}</a>}
                    <a href="#" onClick={() => signOut(auth).then(() => router.push("/"))}>Cerrar Sesión</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;