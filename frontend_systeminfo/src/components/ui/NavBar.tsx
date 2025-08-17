"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from "@/utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import styles from '../../styles/navbar.module.css';
import Logo from './Logo';


interface NavBarProps {
    setIsVisible: (visible: boolean) => void;
    setIsLogin: (login: boolean) => void;
}

const NavBar = ({ setIsVisible, setIsLogin }: NavBarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null); //estado de usuario
    const router = useRouter();

    useEffect(() => {
        //Escuchar cambios de autenticación en Firebase
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/"); // Redirigir al login
    };    

    return (
        
        <nav className={styles.navbar}>
            <span className={`${styles.hamburgerBtn} material-symbols-rounded`} onClick={() => setMenuOpen(!menuOpen)}>menu</span>
            <Logo />
            <ul className={`${styles.links} ${menuOpen ? styles.showMenu : ""}`}>
                <li><Link href="/" className={styles.link}>Inicio</Link></li>
                <li><Link href="/about" className={styles.link}>Acerca de</Link></li>
                <li><Link href="/contact" className={styles.link}>Contactos</Link></li>
                <span className={`${styles.closeBtn} material-symbols-rounded`} onClick={() => setMenuOpen(false)}>close</span>
            </ul>
            {user ? (
                // Si hay usuario, mostrar el botón de "Cerrar Sesión"
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleSignOut}>
                    Cerrar Sesión
                </button>
            ) : (
                // Si no hay usuario, mostrar el botón de "Ingresar"
                <button className={styles.loginBtn} onClick={() => {
                    setIsVisible(true);
                    setIsLogin(true);
                }}>
                    Ingresar
                </button>
            )}
        </nav>
    );
};

export default NavBar;