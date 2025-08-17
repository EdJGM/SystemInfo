// filepath: /C:/Users/LENOVO/Desktop/Uni/Octubre-Marzo 2025/Sistemas Operativos/Tercer Parcial/Deberes/ApiSystemInfo/frontend_systeminfo/src/components/auth/ResetPasswrod.tsx
"use client";
import { useState } from "react";
import { sendPasswordReset } from "@/utils/firebase";
import styles from '../../styles/form.module.css';

const ResetPasswordForm = ({ setIsVisible, resetShowResetPassword }: { setIsVisible: (value: boolean) => void, resetShowResetPassword: () => void }) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await sendPasswordReset(email);
        if (result.success) {
            setMessage("Correo de restablecimiento de contraseña enviado.");
            setError("");
        } else {
            setError(result.message);
            setMessage("");
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        resetShowResetPassword();
    };

    return (
        <div className={`${styles.formBox} ${styles.resetPassword}`}>
            <span className={`material-symbols-rounded ${styles.closeBtn}`} onClick={handleClose}>
                close
            </span>
            <div className={styles.formDetails} style={{ color: "black" }}>
                <h2>Restablecer Contraseña</h2>
                <p>Ingresa tu email para recibir un enlace de restablecimiento</p>
            </div>
            <div className={styles.formContent} style={{ color: "black" }}>
                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleResetPassword}>
                    <div className={styles.inputField}>
                        <input type='email' required value={email} onChange={(e) => setEmail(e.target.value)}></input>
                        <label>Email</label>
                    </div>
                    <button type='submit' className={styles.submitButton}>Enviar</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordForm;