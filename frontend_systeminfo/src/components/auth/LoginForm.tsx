"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase"; // Importamos Firebase
import { useRouter } from "next/navigation";
import styles from '../../styles/form.module.css';
import Link from 'next/link';
import ResetPasswordForm from "./ResetPasswrod";
import { ClipLoader } from 'react-spinners';

const LoginForm = ({ setIsLogin, setIsVisible }: { setIsLogin: (value: boolean) => void, setIsVisible: (value: boolean) => void }) => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsVisible(false); // Oculta el formulario
            router.push("/dashboard"); // Redirige
        } catch (err: any) {
            setError("Error al iniciar sesión. Verifica tus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    if (showResetPassword) {
        return <ResetPasswordForm setIsVisible={setIsVisible} resetShowResetPassword={() => setShowResetPassword(false)} />;
    }

    return (
        <div className={`${styles.formBox} ${styles.login}`}>
            <span className={`material-symbols-rounded ${styles.closeBtn}`} onClick={() => setIsVisible(false)}>
                close
            </span>
            <div className={styles.formDetails}>
                <h2 >Bienvenido</h2>
                <p>Ingresa tus datos para continuar</p>
            </div>
            <div className={styles.formContent}>
                <h2 >INICIAR SESIÓN</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className={styles.inputField}>
                        <input type='text' required value={email} onChange={(e) => setEmail(e.target.value)}></input>
                        <label>Email</label>
                    </div>
                    <div className={styles.inputField}>
                        <input type='password' required value={password} onChange={(e) => setPassword(e.target.value)}></input>
                        <label>Contraseña</label>
                    </div>
                    <Link href="#" className={`${styles.link} ${styles.forgotPassLink}`} onClick={() => setShowResetPassword(true)}>
                        Olvidé mi contraseña
                    </Link>
                    <button type='submit' className={styles.submitButton} disabled={loading}>
                        {loading ? <ClipLoader size={20} color={"#fff"} />: "Ingresar"}
                    </button>
                </form>
                <div className={styles.bottomLink}>
                    ¿No tienes una cuenta?
                    <button className={styles.link} onClick={() => setIsLogin(false)}> Registrate</button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;