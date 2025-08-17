"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";
import Link from 'next/link';
import styles from '../../styles/form.module.css';

const SignupForm = ({ setIsLogin, setIsVisible }: { setIsLogin: (value: boolean) => void, setIsVisible: (value: boolean) => void }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setSuccess("Usuario registrado puede iniciar sesión.");
            setError("");
        } catch (err: any) {
            console.log("Firebase error:", err.code);
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError("El correo electrónico ya está en uso por otra cuenta.");
                    break;
                case 'auth/invalid-email':
                    setError("El correo electrónico no tiene un formato válido.");
                    break;
                case 'auth/operation-not-allowed':
                    setError("El tipo de cuenta correspondiente a la operación no está habilitado.");
                    break;
                case 'auth/weak-password':
                    setError("La contraseña debe tener al menos 6 caracteres."); // Mensaje más específico
                    break;
                case 'auth/missing-password':
                    setError("Por favor, ingresa una contraseña.");
                    break;
                case 'auth/internal-error':
                    setError("Error interno del servidor. Por favor, intenta de nuevo.");
                    break;
                default:
                    setError(`Error al registrarse: ${err.code}`); // Incluir el código de error
            }
            setSuccess("");
        }
    };

    return (
        <div className={`${styles.formBox} ${styles.signup}`}>
            <span className={`material-symbols-rounded ${styles.closeBtn}`} onClick={() => setIsVisible(false)}>
                close
            </span>
            <div className={styles.formDetails}>
                <h2>Crear Una Cuenta</h2>
                <p>Para usar la aplicación de monitoreo, regístrese con su información personal.</p>
            </div>
            <div className={styles.formContent}>
                <h2>REGISTRO</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                <form onSubmit={handleSignup}>
                    <div className={styles.inputField}>
                        <input type='text' required value={email} onChange={(e) => setEmail(e.target.value)}></input>
                        <label>Ingresar Email</label>
                    </div>
                    <div className={styles.inputField}>
                        <input type='password' required value={password} onChange={(e) => setPassword(e.target.value)}></input>
                        <label>Crear Contraseña</label>
                    </div>
                    <div className={styles.policyText}>
                        <input type="checkbox" id="policy" required />
                        <label htmlFor="policy">
                            Estoy de acuerdo con los
                            <Link href="#" className={`${styles.link} ${styles.option}`}>Terminos & Condiciones</Link>
                        </label>
                    </div>
                    <button type='submit' className={styles.submitButton}>Registrarse</button>
                </form>
                <div className={styles.bottomLink}>
                    ¿Ya tienes una cuenta?
                    <button className={styles.link} onClick={() => setIsLogin(true)}>Inciar Sesión</button>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;