"use client"

import React, { useState } from "react";
import NavBar from "@/components/ui/NavBar";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { FaUserGraduate, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import styles from "../../styles/form.module.css";

const Contact = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="bg-cover bg-center min-h-screen" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}>
            <NavBar setIsVisible={setIsVisible} setIsLogin={setIsLogin} />
            <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
                <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    <FaUserGraduate /> Contacto
                </h1>
                <p className="text-gray-700 mt-4">
                    Esta aplicación ha sido desarrollada por estudiantes de la <strong>Universidad de las Fuerzas Armadas ESPE</strong>.
                </p>
                <h2 className="text-2xl font-semibold mt-6 mb-3 flex items-center gap-2">
                    <FaShieldAlt /> Autores
                </h2>
                <ul className="text-gray-700">
                    <li className="flex items-center gap-2"> <FaEnvelope className="text-blue-600" /> Edgar Gallegos - <a href="mailto:ejgallegos@espe.edu.ec" className="text-blue-600">ejgallegos@espe.edu.ec</a></li>
                    <li className="flex items-center gap-2"> <FaEnvelope className="text-blue-600" /> Diego Pilataxi - <a href="mailto:ejgallegos@espe.edu.ec" className="text-blue-600">dapilataxi1@espe.edu.ec</a></li>
                    <li className="flex items-center gap-2"> <FaEnvelope className="text-blue-600" /> Antoni Toapanta - <a href="mailto:ejgallegos@espe.edu.ec" className="text-blue-600">artoapanta3@espe.edu.ec</a></li>
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

export default Contact;