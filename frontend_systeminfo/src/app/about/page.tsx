"use client"

import React, { useState } from "react";
import NavBar from "@/components/ui/NavBar";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { FaLaptopCode, FaDatabase } from "react-icons/fa";
import styles from "../../styles/form.module.css";

const About = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="bg-cover bg-center min-h-screen" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}>
            <NavBar setIsVisible={setIsVisible} setIsLogin={setIsLogin} />
            <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
                <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    <FaLaptopCode /> Acerca de la Aplicación
                </h1>
                <p className="text-gray-700 mt-4">
                    Esta aplicación permite el monitoreo en tiempo real de recursos del sistema, ofreciendo datos detallados sobre CPU, memoria, almacenamiento y red.
                </p>
                <p className="text-gray-700 mt-2">
                    Utiliza <strong>Flask</strong> en el backend para gestionar la monitorización y <strong>Next.js</strong> en el frontend para la visualización de datos.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-3 flex items-center gap-2">
                    <FaDatabase /> Características Principales
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                    <li>Seguimiento detallado del uso de CPU, temperatura y frecuencia.</li>
                    <li>Monitoreo de memoria total, en uso y libre.</li>
                    <li>Estado del almacenamiento en disco con alertas de espacio crítico.</li>
                    <li>Monitoreo de tráfico de red, velocidad de transmisión y conexiones activas.</li>
                    <li>Gestión y supervisión de procesos activos.</li>
                    <li>Alertas visuales cuando los recursos superan umbrales definidos.</li>
                    <li>Almacenamiento histórico de datos para análisis detallado.</li>
                </ul>
            </div>
            <div className={`${styles.overlayContainer} ${isVisible ? styles.showPopup : ""}`}>
                {isVisible && <div className={styles.blurBgOverlay} onClick={() => setIsVisible(false)}></div>}
                <div className={`${styles.formPopup}`}>
                    {isLogin ? (
                        <LoginForm setIsLogin={setIsLogin} setIsVisible={setIsVisible} />
                    ) : (
                        <SignupForm setIsLogin={setIsLogin} setIsVisible={setIsVisible} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default About;